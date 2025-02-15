import{m as r,a as t,s as _,F as e,l as J,q as b}from"./main-04baad83.js";import{G as u,T as Q,M as i,a as N,A as d,$ as n,c as l,h as E,t as B}from"./DarkTheme-7d442e55.js";import{s as V}from"./sensor_types-4db21524.js";const y={analyticsChanges:{}};y.initialize=function(I){const g=this;u.active_tab!="configuration"&&(u.active_tab="configuration",u.configuration_loaded=!0);function U(){r.loadSerialConfig($)}function $(){Promise.resolve(!0).then(()=>i.promise(t.MSP_FEATURE_CONFIG)).then(()=>i.promise(t.MSP_BEEPER_CONFIG)).then(()=>i.promise(t.MSP_BOARD_ALIGNMENT_CONFIG)).then(()=>i.promise(t.MSP_ACC_TRIM)).then(()=>i.promise(t.MSP_ARMING_CONFIG)).then(()=>i.promise(t.MSP_RC_DEADBAND)).then(()=>i.promise(t.MSP_SENSOR_CONFIG)).then(()=>i.promise(t.MSP_SENSOR_ALIGNMENT)).then(()=>_.lt(e.CONFIG.apiVersion,N)?i.promise(t.MSP_NAME):Promise.resolve(!0)).then(()=>_.gte(e.CONFIG.apiVersion,N)?i.promise(t.MSP2_GET_TEXT,r.crunch(t.MSP2_GET_TEXT,t.CRAFT_NAME)):Promise.resolve(!0)).then(()=>i.promise(t.MSP_RX_CONFIG)).then(()=>_.gte(e.CONFIG.apiVersion,N)?i.promise(t.MSP2_GET_TEXT,r.crunch(t.MSP2_GET_TEXT,t.PILOT_NAME)):Promise.resolve(!0)).then(()=>i.promise(t.MSP_ADVANCED_CONFIG)).then(()=>_.gte(e.CONFIG.apiVersion,d)?i.promise(t.MSP_COMPASS_CONFIG):Promise.resolve(!0)).then(()=>H())}function H(){n("#content").load("./tabs/configuration.html",k)}U();function k(){g.analyticsChanges={};const f=n(".tab-configuration .features");e.FEATURE_CONFIG.features.generateElements(f);const X=n(".tab-configuration .dshotbeeper"),O=n("select.dshotBeeperBeaconTone"),v=n("tbody.dshotBeaconConditions"),x=n("tr.dshotBeaconSwitch");for(let a=1;a<=5;a++)O.append(`<option value="${a}">${a}</option>`);X.show(),O.change(function(){e.BEEPER_CONFIG.dshotBeaconTone=O.val()}),O.val(e.BEEPER_CONFIG.dshotBeaconTone);const P=n(".beepers .beeper-template");x.hide(),e.BEEPER_CONFIG.dshotBeaconConditions.generateElements(P,v),n("input.condition",v).change(function(){const a=n(this);e.BEEPER_CONFIG.dshotBeaconConditions.updateData(a)});const W=n(".beepers .beeper-configuration"),z=n(".tab-configuration .beepers");e.BEEPER_CONFIG.beepers.generateElements(P,W),l.localizePage();const m=["CW 0°","CW 90°","CW 180°","CW 270°","CW 0° flip","CW 90° flip","CW 180° flip","CW 270° flip","Custom"],T=n("select.magalign"),S=n("select.gyro_to_use"),A=n("select.gyro_1_align"),M=n("select.gyro_2_align"),D=J(e.CONFIG.activeSensors,"mag")&&_.gte(e.CONFIG.apiVersion,d);D?n('input[name="mag_declination"]').val(e.COMPASS_CONFIG.mag_declination.toFixed(1)):n("div.mag_declination").parent().parent().hide();for(let a=0;a<m.length;a++)T.append(`<option value="${a+1}">${m[a]}</option>`);if(T.val(e.SENSOR_ALIGNMENT.align_mag),T.change(function(){let a=parseInt(n(this).val()),o;a!==e.SENSOR_ALIGNMENT.align_mag&&(o=n(this).find("option:selected").text()),g.analyticsChanges.MagAlignment=o,e.SENSOR_ALIGNMENT.align_mag=a,w()}),_.gte(e.CONFIG.apiVersion,E)){const a=n("select.rangefinderType"),o=V().sonar.elements;for(let s=0;s<o.length;s++)a.append(`<option value="${s}">${o[s]}</option>`);a.val(e.SENSOR_CONFIG.sonar_hardware)}else n(".tab-configuration .rangefinder").parent().hide();if(_.gte(e.CONFIG.apiVersion,E)){const a=n("select.opticalflowType"),o=V().opticalflow.elements;for(let s=0;s<o.length;s++)a.append(`<option value="${s}">${o[s]}</option>`);a.val(e.SENSOR_CONFIG.opticalflow_hardware)}else n(".tab-configuration .opticalflow").parent().hide();const F={DETECTED_GYRO_1:1,DETECTED_GYRO_2:2,DETECTED_DUAL_GYROS:128},G=(e.SENSOR_ALIGNMENT.gyro_detection_flags&F.DETECTED_GYRO_1)!=0,C=(e.SENSOR_ALIGNMENT.gyro_detection_flags&F.DETECTED_GYRO_2)!=0,Y=(e.SENSOR_ALIGNMENT.gyro_detection_flags&F.DETECTED_DUAL_GYROS)!=0;G&&S.append(`<option value="0">${l.getMessage("configurationSensorGyroToUseFirst")}</option>`),C&&S.append(`<option value="1">${l.getMessage("configurationSensorGyroToUseSecond")}</option>`),Y&&S.append(`<option value="2">${l.getMessage("configurationSensorGyroToUseBoth")}</option>`);for(let a=0;a<m.length;a++)A.append(`<option value="${a+1}">${m[a]}</option>`),M.append(`<option value="${a+1}">${m[a]}</option>`);S.val(e.SENSOR_ALIGNMENT.gyro_to_use),A.val(e.SENSOR_ALIGNMENT.gyro_1_align),M.val(e.SENSOR_ALIGNMENT.gyro_2_align);function R(){if(_.gte(e.CONFIG.apiVersion,E)){const a=S.val()==="1"?e.SENSOR_ALIGNMENT.gyro_2_align!==9:e.SENSOR_ALIGNMENT.gyro_1_align!==9;n('input[name="gyro_align_roll"]').attr("disabled",a),n('input[name="gyro_align_pitch"]').attr("disabled",a),n('input[name="gyro_align_yaw"]').attr("disabled",a)}}function w(){_.gte(e.CONFIG.apiVersion,E)&&(n('input[name="mag_align_roll"]').attr("disabled",e.SENSOR_ALIGNMENT.align_mag!==9),n('input[name="mag_align_pitch"]').attr("disabled",e.SENSOR_ALIGNMENT.align_mag!==9),n('input[name="mag_align_yaw"]').attr("disabled",e.SENSOR_ALIGNMENT.align_mag!==9))}_.gte(e.CONFIG.apiVersion,E)?(n(".tab-configuration .gyro_align_custom").show(),n('input[name="gyro_align_roll"]').val(e.SENSOR_ALIGNMENT.gyro_align_roll),n('input[name="gyro_align_pitch"]').val(e.SENSOR_ALIGNMENT.gyro_align_pitch),n('input[name="gyro_align_yaw"]').val(e.SENSOR_ALIGNMENT.gyro_align_yaw),n(".tab-configuration .mag_align_custom").show(),n('input[name="mag_align_roll"]').val(e.SENSOR_ALIGNMENT.mag_align_roll),n('input[name="mag_align_pitch"]').val(e.SENSOR_ALIGNMENT.mag_align_pitch),n('input[name="mag_align_yaw"]').val(e.SENSOR_ALIGNMENT.mag_align_yaw),R(),w()):(n(".tab-configuration .gyro_align_custom").hide(),n(".tab-configuration .mag_align_custom").hide()),n(".gyro_alignment_inputs_first").toggle(G),n(".gyro_alignment_inputs_second").toggle(C),n(".gyro_alignment_inputs_selection").toggle(G||C),n(".gyro_alignment_inputs_notfound").toggle(!G&&!C),A.change(function(){let a=parseInt(n(this).val()),o;a!==e.SENSOR_ALIGNMENT.gyro_1_align&&(o=n(this).find("option:selected").text()),g.analyticsChanges.Gyro1Alignment=o,e.SENSOR_ALIGNMENT.gyro_1_align=a,R()}),M.change(function(){let a=parseInt(n(this).val()),o;a!==e.SENSOR_ALIGNMENT.gyro_2_align&&(o=n(this).find("option:selected").text()),g.analyticsChanges.Gyro2Alignment=o,e.SENSOR_ALIGNMENT.gyro_2_align=a,R()});const q=n("input.gyroFrequency"),h=n("select.gyroSyncDenom"),c=n("select.pidProcessDenom");function K(a,o,s){let p;s===0?p=l.getMessage("configurationSpeedPidNoGyro",{value:o}):p=l.getMessage("configurationKHzUnitLabel",{value:(s/o).toFixed(2)}),a.append(`<option value="${o}">${p}</option>`)}const j=function(a){h.hide();let o;a===0?o=l.getMessage("configurationSpeedGyroNoGyro"):o=l.getMessage("configurationKHzUnitLabel",{value:(a/1e3).toFixed(2)}),q.val(o)};n("div.gyroUse32kHz").hide(),j(e.CONFIG.sampleRateHz),h.val(e.PID_ADVANCED_CONFIG.gyro_sync_denom),n(".systemconfigNote").html(l.getMessage("configurationLoopTimeHelp")),h.change(function(){const a=parseInt(c.val()),o=e.CONFIG.sampleRateHz/1e3,s=8;c.empty();for(let p=1;p<=s;p++)K(c,p,o);c.val(a)}).change(),c.val(e.PID_ADVANCED_CONFIG.pid_process_denom),n('input[id="accHardwareSwitch"]').prop("checked",e.SENSOR_CONFIG.acc_hardware!==1),n('input[id="baroHardwareSwitch"]').prop("checked",e.SENSOR_CONFIG.baro_hardware!==1),n('input[id="magHardwareSwitch"]').prop("checked",e.SENSOR_CONFIG.mag_hardware!==1),_.gte(e.CONFIG.apiVersion,N)?(n('input[name="craftName"]').val(e.CONFIG.craftName),n('input[name="pilotName"]').val(e.CONFIG.pilotName)):(n('input[name="craftName"]').val(e.CONFIG.name),n(".pilotName").hide()),n('input[name="fpvCamAngleDegrees"]').val(e.RX_CONFIG.fpvCamAngleDegrees),n('input[name="board_align_roll"]').val(e.BOARD_ALIGNMENT_CONFIG.roll),n('input[name="board_align_pitch"]').val(e.BOARD_ALIGNMENT_CONFIG.pitch),n('input[name="board_align_yaw"]').val(e.BOARD_ALIGNMENT_CONFIG.yaw),n('input[name="roll"]').val(e.CONFIG.accelerometerTrims[1]),n('input[name="pitch"]').val(e.CONFIG.accelerometerTrims[0]),n('input[id="configurationSmallAngle"]').val(e.ARMING_CONFIG.small_angle),_.gte(e.CONFIG.apiVersion,d)?(n('input[id="configurationGyroCalOnFirstArm"]').prop("checked",e.ARMING_CONFIG.gyro_cal_on_first_arm===1),e.FEATURE_CONFIG.features.isEnabled("MOTOR_STOP")?n('input[id="configurationAutoDisarmDelay"]').val(e.ARMING_CONFIG.auto_disarm_delay):n('input[id="configurationAutoDisarmDelay"]').parent().hide()):(n('input[id="configurationGyroCalOnFirstArm"]').parent().parent().hide(),n('input[id="configurationAutoDisarmDelay"]').parent().parent().hide());function L(){e.FEATURE_CONFIG.features.isEnabled("GPS")?n(".gpsSettings").show():n(".gpsSettings").hide()}n("input.feature",f).change(function(){const a=n(this);e.FEATURE_CONFIG.features.updateData(a),b(e.FEATURE_CONFIG.features),a.attr("name")==="GPS"&&L()}),n('input[id="accHardwareSwitch"]').change(function(){const a=n(this).is(":checked");n(".accelNeeded").toggle(a)}).change(),n(f).filter("select").change(function(){const a=n(this);e.FEATURE_CONFIG.features.updateData(a),b(e.FEATURE_CONFIG.features)}),n("input.condition",z).change(function(){const a=n(this);e.BEEPER_CONFIG.beepers.updateData(a)}),L(),n("a.save").on("click",function(){e.BOARD_ALIGNMENT_CONFIG.roll=parseInt(n('input[name="board_align_roll"]').val()),e.BOARD_ALIGNMENT_CONFIG.pitch=parseInt(n('input[name="board_align_pitch"]').val()),e.BOARD_ALIGNMENT_CONFIG.yaw=parseInt(n('input[name="board_align_yaw"]').val()),_.gte(e.CONFIG.apiVersion,E)&&(e.SENSOR_ALIGNMENT.gyro_align_roll=parseInt(n('input[name="gyro_align_roll"]').val()),e.SENSOR_ALIGNMENT.gyro_align_pitch=parseInt(n('input[name="gyro_align_pitch"]').val()),e.SENSOR_ALIGNMENT.gyro_align_yaw=parseInt(n('input[name="gyro_align_yaw"]').val()),e.SENSOR_ALIGNMENT.mag_align_roll=parseInt(n('input[name="mag_align_roll"]').val()),e.SENSOR_ALIGNMENT.mag_align_pitch=parseInt(n('input[name="mag_align_pitch"]').val()),e.SENSOR_ALIGNMENT.mag_align_yaw=parseInt(n('input[name="mag_align_yaw"]').val())),e.CONFIG.accelerometerTrims[1]=parseInt(n('input[name="roll"]').val()),e.CONFIG.accelerometerTrims[0]=parseInt(n('input[name="pitch"]').val()),_.gte(e.CONFIG.apiVersion,d)&&(e.ARMING_CONFIG.gyro_cal_on_first_arm=n('input[id="configurationGyroCalOnFirstArm"]').is(":checked")?1:0,e.FEATURE_CONFIG.features.isEnabled("MOTOR_STOP")&&(e.ARMING_CONFIG.auto_disarm_delay=parseInt(n('input[id="configurationAutoDisarmDelay"]').val()))),D&&(e.COMPASS_CONFIG.mag_declination=n('input[name="mag_declination"]').val()),_.gte(e.CONFIG.apiVersion,E)&&(e.SENSOR_CONFIG.sonar_hardware=n("select.rangefinderType").val(),e.SENSOR_CONFIG.opticalflow_hardware=n("select.opticalflowType").val()),e.ARMING_CONFIG.small_angle=parseInt(n('input[id="configurationSmallAngle"]').val()),e.SENSOR_ALIGNMENT.gyro_to_use=parseInt(S.val()),e.PID_ADVANCED_CONFIG.gyro_sync_denom=parseInt(h.val());const a=parseInt(c.val());if(a!==e.PID_ADVANCED_CONFIG.pid_process_denom){const s=c.find("option:selected").text();g.analyticsChanges.PIDLoopSettings=`denominator: ${a} | frequency: ${s}`}else g.analyticsChanges.PIDLoopSettings=void 0;e.PID_ADVANCED_CONFIG.pid_process_denom=a,e.RX_CONFIG.fpvCamAngleDegrees=parseInt(n('input[name="fpvCamAngleDegrees"]').val()),B.sendSaveAndChangeEvents(B.EVENT_CATEGORIES.FLIGHT_CONTROLLER,g.analyticsChanges,"configuration"),g.analyticsChanges={},e.SENSOR_CONFIG.acc_hardware=n('input[id="accHardwareSwitch"]').is(":checked")?0:1,e.SENSOR_CONFIG.baro_hardware=n('input[id="baroHardwareSwitch"]').is(":checked")?0:1,e.SENSOR_CONFIG.mag_hardware=n('input[id="magHardwareSwitch"]').is(":checked")?0:1,_.gte(e.CONFIG.apiVersion,N)?(e.CONFIG.craftName=n('input[name="craftName"]').val().trim(),e.CONFIG.pilotName=n('input[name="pilotName"]').val().trim()):e.CONFIG.name=n('input[name="craftName"]').val().trim();function o(){Promise.resolve(!0).then(()=>i.promise(t.MSP_SET_FEATURE_CONFIG,r.crunch(t.MSP_SET_FEATURE_CONFIG))).then(()=>i.promise(t.MSP_SET_BEEPER_CONFIG,r.crunch(t.MSP_SET_BEEPER_CONFIG))).then(()=>i.promise(t.MSP_SET_BOARD_ALIGNMENT_CONFIG,r.crunch(t.MSP_SET_BOARD_ALIGNMENT_CONFIG))).then(()=>i.promise(t.MSP_SET_RC_DEADBAND,r.crunch(t.MSP_SET_RC_DEADBAND))).then(()=>i.promise(t.MSP_SET_SENSOR_ALIGNMENT,r.crunch(t.MSP_SET_SENSOR_ALIGNMENT))).then(()=>i.promise(t.MSP_SET_ADVANCED_CONFIG,r.crunch(t.MSP_SET_ADVANCED_CONFIG))).then(()=>i.promise(t.MSP_SET_ACC_TRIM,r.crunch(t.MSP_SET_ACC_TRIM))).then(()=>i.promise(t.MSP_SET_ARMING_CONFIG,r.crunch(t.MSP_SET_ARMING_CONFIG))).then(()=>i.promise(t.MSP_SET_SENSOR_CONFIG,r.crunch(t.MSP_SET_SENSOR_CONFIG))).then(()=>_.gte(e.CONFIG.apiVersion,N)?i.promise(t.MSP2_SET_TEXT,r.crunch(t.MSP2_SET_TEXT,t.CRAFT_NAME)):i.promise(t.MSP_SET_NAME,r.crunch(t.MSP_SET_NAME))).then(()=>_.gte(e.CONFIG.apiVersion,N)?i.promise(t.MSP2_SET_TEXT,r.crunch(t.MSP2_SET_TEXT,t.PILOT_NAME)):Promise.resolve(!0)).then(()=>_.gte(e.CONFIG.apiVersion,d)?i.promise(t.MSP_SET_COMPASS_CONFIG,r.crunch(t.MSP_SET_COMPASS_CONFIG)):Promise.resolve(!0)).then(()=>r.writeConfiguration(!0))}r.sendSerialConfig(o)}),u.interval_add("status_pull",function(){i.send_message(t.MSP_STATUS)},250,!0),u.content_ready(I)}};y.cleanup=function(I){I&&I()};Q.configuration=y;export{y as configuration};
