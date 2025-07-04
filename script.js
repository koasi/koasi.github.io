let questionBank;
let scoreChart;

function saveScoreHistory(score, totalQuestions) {
    const now = new Date();
    const scoreRecord = {
        timestamp: now.toISOString(),
        score: ((score / totalQuestions) * 100).toFixed(2),
        date: now.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    };

    let history = JSON.parse(localStorage.getItem('random_exam_score_history') || '[]');
    history.push(scoreRecord);
    localStorage.setItem('random_exam_score_history', JSON.stringify(history));
}

function updateScoreChart() {
    const history = JSON.parse(localStorage.getItem('random_exam_score_history') || '[]');
    const recentScores = history.slice(-20);
    
    if (scoreChart) {
        scoreChart.destroy();
    }

    const ctx = document.getElementById('scoreChart').getContext('2d');
    scoreChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: recentScores.map((_, index) => `第${index + 1}次`),
            datasets: [{
                label: '測驗成績',
                data: recentScores.map(record => record.score),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointBackgroundColor: 'rgb(75, 192, 192)',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '分數'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '測驗次數'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const record = recentScores[context.dataIndex];
                            return [`分數: ${record.score}`, `時間: ${record.date}`];
                        }
                    }
                }
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', async function() {
    // =========================================================================
    // 題庫資料 (已整合您提供的 PDF 內容)
    // 請注意：為節省篇幅，這裡只列出部分題目作為範例。
    // 實際使用時，應將所有 588 題填入此陣列。
    // =========================================================================
    // const questionBank =  data;
    await fetch('./exam.json').then(response => response.json()).then(data => {
        // 將原本的 questionBank 賦值移到這裡
    questionBank = JSON.parse(JSON.stringify(data));
        // 其餘代碼保持不變...

    })
    .catch(error => {
        console.error('載入題庫失敗:', error);
    });
    // =========================================================================
    // 系統狀態變數
    // =========================================================================
    let currentExamQuestions = [];
    let chapterWeights = { 1: 1, 2: 1, 3: 1, 4: 1 };
    let isWeightingEnabled ;
    const chapters = {};


    // 檢查 localStorage 中的權重
    const storedWeights = localStorage.getItem('chapterWeights');
    if (storedWeights) {
        try {
            chapterWeights = JSON.parse(storedWeights);
            // 如果有儲存的權重，也要開啟權重模式
            isWeightingEnabled = true;
            weightModeSwitch.checked = true;
        } catch (e) {
            console.error('解析 localStorage 失敗:', e);
        }
    }


    questionBank.forEach(q => {
        if (!chapters[q.chapter_number]) {
            chapters[q.chapter_number] = {
                name: q.chapter_name,
                questions: []
            };
        }
        chapters[q.chapter_number].questions.push(q);
    });


    

    // =========================================================================
    // DOM 元素獲取
    // =========================================================================
    const clearScoresBtn = document.getElementById('clear-scores-btn');
    const resetWeightsBtn = document.getElementById('reset-weights-btn');
    const mainMenu = document.getElementById('main-menu');
    const chapterOptions = document.getElementById('chapter-options');
    const randomOptions = document.getElementById('random-options');
    const examArea = document.getElementById('exam-area');
    const resultArea = document.getElementById('result-area');
    const backButtons = document.querySelectorAll('.back-btn');
    
    // 按鈕
    const chapterModeBtn = document.getElementById('chapter-mode-btn');
    const randomModeBtn = document.getElementById('random-mode-btn');
    const startChapterExamBtn = document.getElementById('start-chapter-exam');
    const startRandomExamBtn = document.getElementById('start-random-exam');
    const submitExamBtn = document.getElementById('submit-exam-btn');
    

    // 下拉選單和輸入框
    const chapterSelect = document.getElementById('chapter-select');
    const blockSelect = document.getElementById('block-select');
    const randomQuestionCountInput = document.getElementById('random-question-count');

    // 權重模式開關
    const weightModeSwitch = document.getElementById('weight-mode-switch');
    const weightStatus = document.getElementById('weight-status');
    const randomOptionSwitch = document.getElementById('random-option-switch');
    // 顯示區
    const questionContainer = document.getElementById('question-container');
    const resultDetails = document.getElementById('result-details');
    const scoreDisplay = document.getElementById('score');
    const progressBar = document.getElementById('progress-bar');

//  =========================================================================
// 權重儲存功能
function saveWeightsToStorage() {
    localStorage.setItem('chapterWeights', JSON.stringify(chapterWeights));
}

function loadWeightsFromStorage() {
    const storedWeights = localStorage.getItem('chapterWeights');
    if (storedWeights) {
        try {
            return JSON.parse(storedWeights);
        } catch (e) {
            console.error('解析 localStorage 失敗:', e);
            return null;
        }
    }
    return null;
}


    // =========================================================================
    // 核心功能函式
    // =========================================================================
    function showScreen(screen) {
        mainMenu.style.display = 'none';
        chapterOptions.style.display = 'none';
        randomOptions.style.display = 'none';
        examArea.style.display = 'none';
        resultArea.style.display = 'none';
        screen.style.display = 'block';
    }

    function updateWeightStatus() {
        if (isWeightingEnabled) {
            let statusText = "目前權重: ";
            for (const chapter in chapterWeights) {
                statusText += `第${chapter}章: ${chapterWeights[chapter].toFixed(1)} `;
            }
            weightStatus.textContent = statusText;
        } else {
            weightStatus.textContent = "權重模式已關閉。";
        }
    }
    
    function generateChapterExam(chapterNum, blockNum) {
        const questionsInChapter = chapters[chapterNum].questions;
        const startIndex = (blockNum - 1) * 40;
        const endIndex = startIndex + 40;
        return questionsInChapter.slice(startIndex, endIndex);
    }

    function generateRandomExam(count) {
        if (!isWeightingEnabled) {
            // 純隨機
            return [...questionBank].sort(() => 0.5 - Math.random()).slice(0, count);
        } else {
            // 權重模式
            const weightedPool = [];
            questionBank.forEach(q => {
                const weight = chapterWeights[q.chapter_number] || 1;
                for (let i = 0; i < weight; i++) {
                    weightedPool.push(q);
                }
            });

            const selectedQuestions = new Set();
            while (selectedQuestions.size < count && weightedPool.length > 0) {
                const randomIndex = Math.floor(Math.random() * weightedPool.length);
                selectedQuestions.add(weightedPool[randomIndex]);
            }
            return Array.from(selectedQuestions);
        }
    }

    function startExam(questions) {
        currentExamQuestions = questions;
        questionContainer.innerHTML = '';
        progressBar.style.width = '0%';
        
        questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            
            let optionsHTML = '';
            for (const key in q.options) {
                optionsHTML += `
                    <label>
                        <input type="radio" name="question${index}" value="${key}">
                        (${key}) ${q.options[key]}
                    </label>
                `;
            }

            questionDiv.innerHTML = `
                <div class="question-text">${index + 1}. ${q.text}</div>
                <div class="options">${optionsHTML}</div>
            `;
            questionContainer.appendChild(questionDiv);
        });

        // 進度條監聽
        const inputs = questionContainer.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                const answeredCount = questionContainer.querySelectorAll('input[type="radio"]:checked').length;
                const progress = (answeredCount / currentExamQuestions.length) * 100;
                progressBar.style.width = `${progress}%`;
            });
        });

        showScreen(examArea);
    }

    function submitExam() {
        let score = 0;
        const results = [];
        
        currentExamQuestions.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
            const userAnswer = selectedOption ? selectedOption.value : null;

            const isCorrect = userAnswer === q.correct_answer;
            if (isCorrect) {
                score++;
            }
            
            results.push({
                question: q,
                userAnswer: userAnswer,
                isCorrect: isCorrect
            });
        });

        displayResults(score, results);
        if (isWeightingEnabled) {
            updateWeights(results);
        }
        // 儲存隨機測驗的成績
        if (currentExamQuestions.length === parseInt(randomQuestionCountInput.value, 10)) {
            saveScoreHistory(score, currentExamQuestions.length);
        }
        showScreen(resultArea);
    }
    
    function displayResults(score, results) {
        scoreDisplay.textContent = `總分: ${score} / ${results.length} (${((score / results.length) * 100).toFixed(2)}%)`;
        resultDetails.innerHTML = '';
        
        results.forEach((res, index) => {
            const q = res.question;
            let resultHTML = `<div class="result-item">`;
            resultHTML += `<div class="result-question">${index + 1}. ${q.text}</div>`;
            resultHTML += `<div class="result-answer">`;
            
            if (res.isCorrect) {
                 resultHTML += `<p><span class="user-answer-label">您的答案: </span><span class="correct-answer">(${res.userAnswer}) ${q.options[res.userAnswer]} (正確)</span></p>`;
            } else {
                 if(res.userAnswer) {
                    resultHTML += `<p><span class="user-answer-label">您的答案: </span><span class="wrong-answer">(${res.userAnswer}) ${q.options[res.userAnswer]} (錯誤)</span></p>`;
                 } else {
                    resultHTML += `<p><span class="user-answer-label">您的答案: </span><span class="wrong-answer">未作答</span></p>`;
                 }
                 resultHTML += `<p><span class="user-answer-label">正確答案: </span><span class="correct-answer">(${q.correct_answer}) ${q.options[q.correct_answer]}</span></p>`;
            }
            
            resultHTML += `</div></div>`;
            resultDetails.innerHTML += resultHTML;
        });
    }

    function updateWeights(results) {
        results.forEach(res => {
            if (!res.isCorrect) {
                chapterWeights[res.question.chapter_number]++;
            }
        });
        // 儲存更新後的權重
        localStorage.setItem('chapterWeights', JSON.stringify(chapterWeights));
        updateWeightStatus();
    }


    // =========================================================================
    // 事件監聽器設定
    // =========================================================================
    chapterModeBtn.addEventListener('click', () => {
        // 填充章節下拉選單
        chapterSelect.innerHTML = '';
        for (const num in chapters) {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = `第${num}章 ${chapters[num].name}`;
            chapterSelect.appendChild(option);
        }
        chapterSelect.dispatchEvent(new Event('change')); // 觸發一次change來填充區塊
        showScreen(chapterOptions);
    });

    chapterSelect.addEventListener('change', () => {
        const chapterNum = chapterSelect.value;
        const questionCount = chapters[chapterNum].questions.length;
        const blockCount = Math.ceil(questionCount / 40);
        
        blockSelect.innerHTML = '';
        for (let i = 1; i <= blockCount; i++) {
            const start = (i - 1) * 40 + 1;
            const end = Math.min(i * 40, questionCount);
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `第 ${start}-${end} 題`;
            blockSelect.appendChild(option);
        }
    });

    randomModeBtn.addEventListener('click', () => {
        showScreen(randomOptions);
    });

    startChapterExamBtn.addEventListener('click', () => {
        const chapterNum = chapterSelect.value;
        const blockNum = blockSelect.value;
        const questions = generateChapterExam(chapterNum, blockNum);
        startExam(questions);
    });

    startRandomExamBtn.addEventListener('click', () => {
        const count = parseInt(randomQuestionCountInput.value, 10);
        const questions = generateRandomExam(count);
        startExam(questions);
    });
    
    submitExamBtn.addEventListener('click', () => {
        if (confirm('確定要提交答案嗎？')) {
            submitExam();
        }
    });


    // 保存原始題庫的副本
    let originalQuestionBank = null;

    randomOptionSwitch.addEventListener('change', () => {
        if (randomOptionSwitch.checked) {
            // 第一次開啟時保存原始題庫
            if (!originalQuestionBank) {
                originalQuestionBank = JSON.parse(JSON.stringify(questionBank));
            }

            // 開啟選項亂數模式
            questionBank.forEach(q => {
                // 獲取選項內容和對應的鍵
                const optionEntries = Object.entries(q.options);
                const hasAllAbove = optionEntries.some(([_, value]) => 
                    value.includes('以上皆是') || 
                    value.includes('以上皆非') || 
                    value.includes('以上皆可') ||
                    value.includes('以上皆對') ||
                    value.includes('以上皆錯')
                );

                if (hasAllAbove) {
                    // 如果有"以上皆是"類選項,保持在D選項,只打亂其他選項
                    const dOption = optionEntries.find(([_, value]) => 
                        value.includes('以上皆是') || 
                        value.includes('以上皆非') || 
                        value.includes('以上皆可') ||
                        value.includes('以上皆對') ||
                        value.includes('以上皆錯')
                    );
                    const otherOptions = optionEntries.filter(([_, value]) => 
                        !value.includes('以上皆是') && 
                        !value.includes('以上皆非') && 
                        !value.includes('以上皆可') &&
                        !value.includes('以上皆對') &&
                        !value.includes('以上皆錯')
                    );
                    
                    // 打亂其他選項
                    for (let i = otherOptions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [otherOptions[i], otherOptions[j]] = [otherOptions[j], otherOptions[i]];
                    }

                    // 重新組合選項,保持"以上皆是"在D
                    const newOptions = {};
                    otherOptions.slice(0, 3).forEach(([_, value], index) => {
                        newOptions[String.fromCharCode(65 + index)] = value;
                    });
                    newOptions['D'] = dOption[1];

                    // 更新選項和答案
                    q.options = newOptions;
                    // 找到新的正確答案位置
                    const originalCorrectValue = originalQuestionBank.find(oq => oq.unique_id === q.unique_id).options[originalQuestionBank.find(oq => oq.unique_id === q.unique_id).correct_answer];
                    q.correct_answer = Object.entries(newOptions).find(([_, value]) => value === originalCorrectValue)[0];
                } else {
                    // 如果沒有"以上皆是"選項,則完全隨機打亂
                    const shuffledOptions = {};
                    const keys = ['A', 'B', 'C', 'D'];
                    const values = Object.values(q.options);
                    const shuffledIndices = Array.from({length: 4}, (_, i) => i)
                        .sort(() => Math.random() - 0.5);
                    
                    shuffledIndices.forEach((index, i) => {
                        shuffledOptions[keys[i]] = values[index];
                    });

                    // 更新選項和答案
                    q.options = shuffledOptions;
                    // 找到新的正確答案位置
                    const originalCorrectValue = originalQuestionBank.find(oq => oq.unique_id === q.unique_id).options[originalQuestionBank.find(oq => oq.unique_id === q.unique_id).correct_answer];
                    q.correct_answer = Object.entries(shuffledOptions).find(([_, value]) => value === originalCorrectValue)[0];
                }
            });
        } else {
            // 關閉選項亂數模式,恢復原本的選項順序
            if (originalQuestionBank) {
                questionBank = JSON.parse(JSON.stringify(originalQuestionBank));
            }
        }
    });

    
    weightModeSwitch.addEventListener('change', () => {
        isWeightingEnabled = weightModeSwitch.checked;
        if (!isWeightingEnabled) {
            // 關閉時重置權重
            chapterWeights = { 1: 1, 2: 1, 3: 1, 4: 1 };
            // 清除 localStorage 中的權重
            localStorage.removeItem('chapterWeights');
        }
        updateWeightStatus();
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen(mainMenu);
            updateScoreChart();
        });
    });

    clearScoresBtn.addEventListener('click', () => {
        if (confirm('確定要清除所有成績記錄嗎？此操作無法復原。')) {
            localStorage.removeItem('random_exam_score_history');
            updateScoreChart();
        }
    });

    resetWeightsBtn.addEventListener('click', () => {
        if (confirm('確定要重置所有章節權重嗎？')) {
            chapterWeights = { 1: 1, 2: 1, 3: 1, 4: 1 };
            localStorage.removeItem('chapterWeights');
            updateWeightStatus();
        }
    });

    // =========================================================================
    // 初始設定
    // =========================================================================
    updateWeightStatus();
    updateScoreChart();
    showScreen(mainMenu);

});
