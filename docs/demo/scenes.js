// docs/demo/scenes.js — a fake Home Assistant (invented entities, no real data) and the demo scenes used for the screenshots in docs/img.
// Open docs/demo/index.html?scene=flow&preset=green&lang=en&w=460 in a browser (after `node build.mjs`).
(function () {
  const now = Date.now();
  const A = (state, attributes) => ({ state: String(state), attributes: attributes || {} });
  const pwr = (v, name) => A(v, { unit_of_measurement: 'W', device_class: 'power', friendly_name: name });
  const day = (n) => { const d = new Date(now + n * 864e5); d.setHours(12, 0, 0, 0); return d.toISOString(); };
  const ymd = (n) => { const d = new Date(now + n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  const states = {
    // lights, plugs, locks
    'light.kitchen': A('on', { friendly_name: 'Kitchen', brightness: 200, supported_color_modes: ['brightness'] }),
    'light.living_room': A('on', { friendly_name: 'Living room', brightness: 180, supported_color_modes: ['color_temp'] }),
    'light.bedroom': A('off', { friendly_name: 'Bedroom', supported_color_modes: ['onoff'] }),
    'light.living_lamp': A('on', { friendly_name: 'Living lamp', brightness: 190, color_mode: 'color_temp', color_temp_kelvin: 3300, min_color_temp_kelvin: 2200, max_color_temp_kelvin: 6500, rgb_color: [255, 190, 120], supported_color_modes: ['color_temp', 'rgb'] }),
    'light.pool': A('on', { friendly_name: 'Pool light', supported_color_modes: ['onoff'] }),
    'switch.garden_pump': A('off', { friendly_name: 'Garden pump' }),
    'switch.pool_pump': A('on', { friendly_name: 'Pool pump' }),
    'lock.front_door': A('locked', { friendly_name: 'Front door' }),
    'cover.garage': A('closed', { friendly_name: 'Garage door', device_class: 'garage' }),
    'binary_sensor.bedroom_window': A('on', { friendly_name: 'Bedroom window', device_class: 'window' }),
    'binary_sensor.rain': A('on', { friendly_name: 'Rain' }),
    'group.all_lights': A('on', { friendly_name: 'Lights', entity_id: ['light.kitchen', 'light.living_room', 'light.pool', 'light.bedroom'] }),
    'sensor.living_temperature': A('24.6', { friendly_name: 'Living temperature', unit_of_measurement: '°C', device_class: 'temperature' }),
    'sensor.feels_like': A('34', { friendly_name: 'Feels like', unit_of_measurement: '°C' }),
    'sensor.washer_status': A('spinning', { friendly_name: 'Washer' }),
    'sensor.washer_remaining': A(new Date(now + 38 * 60000).toISOString(), { friendly_name: 'Washer remaining', device_class: 'timestamp' }),
    // climate, fan, media, remote
    'climate.living_ac': A('cool', { friendly_name: 'Living A/C', current_temperature: 24.6, temperature: 23, min_temp: 16, max_temp: 30, target_temp_step: 0.5, hvac_modes: ['off', 'cool', 'heat', 'auto', 'dry', 'fan_only'], hvac_action: 'cooling', fan_modes: ['auto', 'low', 'medium', 'high'], fan_mode: 'auto', swing_modes: ['off', 'vertical'], swing_mode: 'off' }),
    'climate.bedroom_ac': A('heat', { friendly_name: 'Bedroom A/C', current_temperature: 20.1, temperature: 22, hvac_modes: ['off', 'heat', 'cool'], hvac_action: 'heating' }),
    'fan.ventilation': A('on', { friendly_name: 'Ventilation', percentage: 60, percentage_step: 20, preset_modes: ['auto', 'night', 'boost'], preset_mode: 'auto', supported_features: 25 }),
    'media_player.living_tv': A('playing', { friendly_name: 'Living TV', media_title: 'Nature Documentary', app_name: 'Streaming', volume_level: 0.4, is_volume_muted: false, supported_features: 21949 }),
    'number.timer': A('30', { friendly_name: 'Timer', min: 0, max: 120, step: 5, unit_of_measurement: 'min' }),
    'select.program': A('eco', { friendly_name: 'Program', options: ['eco', 'comfort', 'boost'] }),
    'remote.living_room_tv': A('on', { friendly_name: 'Living room TV' }),
    // radio
    'input_select.radio_favorite': A('Jazz Lounge - https://radio.example/jazz', { options: ['Chill Waves - https://radio.example/chill', 'Jazz Lounge - https://radio.example/jazz', 'Morning Pop - https://radio.example/pop', 'Classic FM - https://radio.example/classic', 'Custom (use the URL below)'] }),
    'input_boolean.radio_playing': A('on'),
    'media_player.pool_speaker': A('playing', { friendly_name: 'Pool speaker', volume_level: 0.35, supported_features: 4 | 16384, media_title: 'Blue in Green', media_artist: 'Jazz Lounge' }),
    'media_player.living_speaker': A('idle', { friendly_name: 'Living speaker', volume_level: 0.5, supported_features: 4 }),
    // energy
    'sensor.solar_power': pwr(3200, 'Solar'), 'sensor.grid_power': pwr(900, 'Grid'), 'sensor.battery_power': pwr(-800, 'Battery'),
    'sensor.battery_soc': A('68', { unit_of_measurement: '%', device_class: 'battery', friendly_name: 'Battery' }),
    'sensor.house_power': pwr(700, 'House'), 'sensor.shed_a': pwr(150, 'Shed A'), 'sensor.shed_b': pwr(150, 'Shed B'), 'sensor.shed_c': pwr(150, 'Shed C'),
    'sensor.pool_power': pwr(250, 'Pool'), 'sensor.ev_power': pwr(100, 'EV charger'), 'sensor.load_power': pwr(1500, 'Load'),
    'sensor.import_today': A('3.1', { unit_of_measurement: 'kWh', friendly_name: 'Import today' }), 'sensor.export_today': A('12.4', { unit_of_measurement: 'kWh', friendly_name: 'Export today' }),
    'sensor.battery_charged_today': A('8.2', { unit_of_measurement: 'kWh', friendly_name: 'Charged today' }),
    'binary_sensor.grid_present': A('on', { friendly_name: 'Grid' }), 'binary_sensor.grid_down': A('off', { friendly_name: 'Grid (outage)' }),
    // device batteries
    'sensor.tablet_battery': A('82', { unit_of_measurement: '%', friendly_name: 'Tablet' }), 'sensor.phone_battery': A('45', { unit_of_measurement: '%', friendly_name: 'Phone' }),
    'sensor.toothbrush_battery': A('0', { unit_of_measurement: '%', device_class: 'battery', friendly_name: 'Toothbrush Battery' }), 'sensor.water_sensor_battery': A('20', { unit_of_measurement: '%', device_class: 'battery', friendly_name: 'Kitchen water sensor Battery' }),
    'sensor.smoke_battery': A('74', { unit_of_measurement: '%', device_class: 'battery', friendly_name: 'Smoke detector Battery' }), 'sensor.mower_battery': A('100', { unit_of_measurement: '%', device_class: 'battery', friendly_name: 'Mower Battery' }),
    'sensor.car_battery': A('18', { unit_of_measurement: '%', friendly_name: 'Car' }), 'sensor.remote_battery': A('8', { unit_of_measurement: '%', friendly_name: 'Remote' }),
    // people
    'person.ana': A('home', { friendly_name: 'Ana' }), 'person.maria': A('not_home', { friendly_name: 'Maria' }), 'person.alex': A('home', { friendly_name: 'Alex' }),
    // weather
    'sun.sun': A('above_horizon', { elevation: 40 }),
    'weather.home': A('partlycloudy', { friendly_name: 'Home', temperature: 18, temperature_unit: '°C', humidity: 62, wind_speed: 14, wind_speed_unit: 'km/h', pressure: 1014 }),
    'weather.home_rain': A('rainy', { friendly_name: 'Home', temperature: 8, temperature_unit: '°C', humidity: 90, wind_speed: 22, wind_speed_unit: 'km/h', pressure: 1002 }),
    'sensor.temp': A('18.4', { unit_of_measurement: '°C' }), 'sensor.temp_rain': A('7.6', { unit_of_measurement: '°C' }), 'sensor.feels': A('17.9', { unit_of_measurement: '°C' }), 'sensor.hum': A('62', { unit_of_measurement: '%' }), 'sensor.hum_rain': A('91', { unit_of_measurement: '%' }),
    'sensor.wind': A('14', { unit_of_measurement: 'km/h' }), 'sensor.wind_rain': A('24', { unit_of_measurement: 'km/h' }), 'sensor.gust': A('22', { unit_of_measurement: 'km/h' }), 'sensor.dir': A('225', { unit_of_measurement: '°' }),
    'sensor.rain_rate': A('0', { unit_of_measurement: 'mm/h' }), 'sensor.rain_rate_rain': A('3.4', { unit_of_measurement: 'mm/h' }), 'sensor.rain_today': A('1.2', { unit_of_measurement: 'mm' }), 'sensor.rain_today_rain': A('6.8', { unit_of_measurement: 'mm' }),
    'binary_sensor.raining': A('off'), 'binary_sensor.raining_rain': A('on'),
    'sensor.pressure': A('1014', { unit_of_measurement: 'hPa' }), 'sensor.uv': A('3', { unit_of_measurement: 'UV index' }), 'sensor.radiation': A('420', { unit_of_measurement: 'W/m²' }),
    'sensor.house_delta': A('-0.36', { unit_of_measurement: 'kW', friendly_name: 'House change' }),
    // animated icons / nav
    'switch.gas_heater': A('on', { friendly_name: 'Heating' }), 'switch.ev_charger': A('on', { friendly_name: 'EV charger' }), 'switch.solar_inverter': A('on', { friendly_name: 'Solar' }),
    'sensor.lights_on': A('3', { friendly_name: 'Lights on' }), 'binary_sensor.cam1_person': A('on', { friendly_name: 'Cam 1' }), 'binary_sensor.cam2_person': A('on', { friendly_name: 'Cam 2' }),
    // vehicles
    'input_datetime.car_insurance': A(ymd(60), { has_date: true, has_time: false }), 'input_datetime.car_inspection': A(ymd(3), { has_date: true, has_time: false }), 'input_datetime.car_road_tax': A(ymd(-2), { has_date: true, has_time: false }),
    'sensor.car_service_date': A(ymd(320), { device_class: 'date' }), 'sensor.car_odometer': A('52490', { unit_of_measurement: 'km' }), 'input_number.car_oil_km': A('52090', { unit_of_measurement: 'km' }),
    'input_datetime.van_insurance': A(ymd(200), { has_date: true, has_time: false }), 'input_datetime.van_inspection': A('1970-01-01', { has_date: true, has_time: false }), 'input_datetime.van_road_tax': A(ymd(14), { has_date: true, has_time: false }),
    'calendar.waste': A('on', { friendly_name: 'Waste' }),
  };

  const forecast = (rain) => [0, 1, 2, 3, 4].map((i) => ({ datetime: day(i), condition: rain ? ['rainy', 'rainy', 'cloudy', 'partlycloudy', 'sunny'][i] : ['partlycloudy', 'sunny', 'sunny', 'cloudy', 'rainy'][i], temperature: (rain ? [9, 10, 12, 14, 16] : [19, 22, 24, 20, 17])[i], templow: (rain ? [5, 6, 7, 8, 9] : [10, 12, 13, 12, 11])[i], precipitation_probability: (rain ? [90, 70, 30, 10, 0] : [10, 0, 0, 30, 70])[i], precipitation: rain ? [6, 3, 0, 0, 0][i] : [0, 0, 0, 1, 4][i], wind_speed: 14 + i * 2, wind_bearing: 225 }));

  // smooth, deterministic history for graphs and sparklines
  const series = (id, start, end) => {
    const n = 48, out = [];
    const shape = { 'sensor.solar_power': (x) => Math.max(0, Math.sin(x * 2.15)) * 3800, 'sensor.house_power': (x) => 900 + 500 * Math.sin(x * 12) + 350 * Math.sin(x * 31), 'sensor.living_temperature': (x) => 22 + 2.2 * Math.sin(x * 6) };
    const f = shape[id] || ((x) => 500 + 300 * Math.sin(x * 9));
    for (let i = 0; i < n; i++) { const x = i / (n - 1); out.push({ s: String(Math.round(f(x) * 10) / 10), lu: (start + (end - start) * x) / 1000 }); }
    return out;
  };

  const makeHass = (lang) => ({
    states, language: lang, locale: { language: lang }, themes: {}, user: { name: 'Demo' }, config: { unit_system: { temperature: '°C' } },
    callService() {},
    async callWS(msg) {
      if (msg.type === 'history/history_during_period') { const o = {}; (msg.entity_ids || []).forEach((id) => { o[id] = series(id, Date.parse(msg.start_time), Date.parse(msg.end_time)); }); return o; }
      if (msg.type === 'call_service' && msg.service === 'get_forecasts') { const id = msg.target.entity_id; return { response: { [id]: { forecast: forecast(id.endsWith('rain')) } } }; }
      if (msg.type === 'call_service' && msg.service === 'get_events') {
        return { response: { 'calendar.waste': { events: [{ summary: 'Waste: General', start: ymd(0) }, { summary: 'Waste: Plastic', start: ymd(1) }] } } };
      }
      return {};
    },
  });

  const BTN = (entity, name, icon, extra) => ({ entity, name, icon, ...(extra || {}) });
  const scenes = {
    buttons: { w: 440, cards: [
      { type: 'custom:ccu-buttons-card', title: 'Rooms', columns: 2, columns_wide: 2, entities: [BTN('light.kitchen', 'Kitchen', 'mdi:pot-steam'), BTN('light.living_room', 'Living room', 'mdi:sofa'), BTN('light.bedroom', 'Bedroom', 'mdi:bed-double'), BTN('lock.front_door', 'Front door', 'mdi:lock'), BTN('cover.garage', 'Garage', 'mdi:garage'), BTN('sensor.living_temperature', 'Living', 'mdi:thermometer'), BTN('binary_sensor.bedroom_window', 'Window', 'mdi:window-open', { on_as: 'alert' }), BTN('switch.garden_pump', 'Garden', 'mdi:sprinkler')] },
      { type: 'custom:ccu-buttons-card', columns: 1, entities: [BTN('sensor.house_power', 'Consumption', 'mdi:flash', { size: 'xl', spark: { hours: 6 } })] },
      { type: 'custom:ccu-buttons-card', columns: 4, density: 'xs', entities: [BTN('light.kitchen', 'Light', 'mdi:lightbulb'), BTN('lock.front_door', 'Door', 'mdi:lock'), BTN('switch.pool_pump', 'Pump', 'mdi:pump'), BTN('light.bedroom', 'Bedroom', 'mdi:bed-double')] },
    ] },
    chips: { w: 480, cards: [{ type: 'custom:ccu-chips-card', entities: [BTN('climate.living_ac', 'A/C', 'mdi:air-conditioner'), BTN('binary_sensor.rain', 'Rain', 'mdi:weather-rainy', { hide_off: true }), BTN('sensor.feels_like', 'Feels like', 'mdi:thermometer-alert', { show_state: true, alert_above: 32, hide_off: true }), BTN('switch.pool_pump', 'Pool pump', 'mdi:pump', { hide_off: true }), BTN('light.pool', 'Pool light', 'mdi:lightbulb', { hide_off: true }), { entity: 'sensor.washer_status', name: 'Washer', icon: 'mdi:washing-machine', hide_off: true, show_state: true, on_states: ['running', 'spinning', 'rinsing'], text_map: { spinning: 'Spin', running: 'Wash' }, secondary: { entity: 'sensor.washer_remaining' } }, BTN('group.all_lights', 'Lights', 'mdi:lightbulb', { count: true, hide_off: true })], low_batteries: { threshold: 20, tap_action: { action: 'none' } }, deadlines: { alert_days: 3, vehicles: [{ name: 'Family car', documents: [{ label: 'Inspection', entity: 'input_datetime.car_inspection' }, { label: 'Road tax', entity: 'input_datetime.car_road_tax' }] }] }, waste: { calendar: 'calendar.waste', next_days: 1, hide_today_after: '23:59', patterns: [{ match: 'Waste: General', label: 'General', icon: 'mdi:trash-can', exact: true }, { match: 'Waste: Plastic', label: 'Plastic', icon: 'mdi:recycle', exact: true }] } }] },
    controls: { w: 440, cards: [{ type: 'custom:ccu-controls-card', columns: 1, title: 'Living room', items: [{ entity: 'climate.living_ac', name: 'Living A/C' }, { entity: 'light.living_lamp', name: 'Living lamp' }] }] },
    'controls-more': { w: 440, cards: [{ type: 'custom:ccu-controls-card', columns: 1, title: 'More controls', items: [{ entity: 'fan.ventilation', name: 'Ventilation' }, { entity: 'media_player.living_tv', name: 'Living TV' }, { entity: 'number.timer', name: 'Timer' }, { entity: 'select.program', name: 'Program' }] }] },
    radio: { w: 440, cards: [{ type: 'custom:ccu-radio-card', title: 'Pool radio', stations: 'input_select.radio_favorite', player: 'media_player.pool_speaker', speakers: ['media_player.pool_speaker', 'media_player.living_speaker'], playing: 'input_boolean.radio_playing', hide: ['Custom'] }] },
    remote: { w: 340, cards: [{ type: 'custom:ccu-remote-card', title: 'Living room TV', entity: 'remote.living_room_tv', extra: [{ label: 'Stream', icon: 'play', command: 'KEY_APP' }] }] },
    flow: { w: 480, cards: [{ type: 'custom:ccu-flow-card', title: 'Energy flow', solar: 'sensor.solar_power', grid: { entity: 'sensor.grid_power', invert: true }, battery: { entity: 'sensor.battery_power', soc: 'sensor.battery_soc' }, consumers: [{ entity: 'sensor.house_power', name: 'House', icon: 'mdi:home' }, { entities: ['sensor.shed_a', 'sensor.shed_b', 'sensor.shed_c'], name: 'Workshop', icon: 'mdi:warehouse' }, { entity: 'sensor.pool_power', name: 'Pool', icon: 'mdi:pool' }, { entity: 'sensor.ev_power', name: 'EV charger', icon: 'mdi:car-electric' }], stats: [{ entity: 'sensor.import_today', label: 'Import today', icon: 'mdi:transmission-tower' }, { entity: 'sensor.export_today', label: 'Export today', icon: 'mdi:flash' }, { entity: 'sensor.battery_charged_today', label: 'Charged today', icon: 'mdi:battery-charging' }] }] },
    battery: { w: 440, cards: [
      { type: 'custom:ccu-battery-card', soc: 'sensor.battery_soc', capacity_kwh: 10, load: 'sensor.load_power', power: 'sensor.battery_power', grid_present: 'binary_sensor.grid_present', reserve_pct: 20, shutdown_pct: 10 },
      { type: 'custom:ccu-battery-card', soc: 'sensor.battery_soc', capacity_kwh: 10, load: 'sensor.load_power', grid_present: 'binary_sensor.grid_down', reserve_pct: 20, shutdown_pct: 10 },
      { type: 'custom:ccu-batteries-card', title: 'Device batteries', entities: ['sensor.tablet_battery', 'sensor.phone_battery', 'sensor.car_battery', 'sensor.remote_battery'] },
      { type: 'custom:ccu-batteries-card', title: 'Batteries found automatically', auto: { threshold: 20 } },
    ] },
    graph: { w: 480, cards: [
      { type: 'custom:ccu-graph-card', title: 'Energy (last 24 h)', range: '24h', tabs: ['6h', '24h', '7d'], height: 150, series: [{ entity: 'sensor.house_power', name: 'Consumption', color: 'accent', kind: 'area' }, { entity: 'sensor.solar_power', name: 'Solar', color: 'yellow', kind: 'line' }] },
      { type: 'custom:ccu-graph-card', title: 'Living temperature', range: '12h', compact: true, height: 90, series: [{ entity: 'sensor.living_temperature', name: 'Temperature', color: 'green', kind: 'area' }] },
    ] },
    weather: { w: 480, cards: [{ type: 'custom:ccu-weather-card', title: 'Weather', weather: 'weather.home', sensors: { temperature: 'sensor.temp', feels_like: 'sensor.feels', humidity: 'sensor.hum', wind_speed: 'sensor.wind', wind_gust: 'sensor.gust', wind_direction: 'sensor.dir', rain_rate: 'sensor.rain_rate', rain_today: 'sensor.rain_today', rain_state: 'binary_sensor.raining', pressure: 'sensor.pressure', uv: 'sensor.uv', radiation: 'sensor.radiation' }, tiles: ['humidity', 'wind', 'rain', 'pressure', 'uv', 'radiation'], days: 5 }] },
    'weather-rain': { w: 480, cards: [{ type: 'custom:ccu-weather-card', title: 'Weather', weather: 'weather.home_rain', sensors: { temperature: 'sensor.temp_rain', feels_like: 'sensor.feels', humidity: 'sensor.hum_rain', wind_speed: 'sensor.wind_rain', wind_gust: 'sensor.gust', wind_direction: 'sensor.dir', rain_rate: 'sensor.rain_rate_rain', rain_today: 'sensor.rain_today_rain', rain_state: 'binary_sensor.raining_rain', pressure: 'sensor.pressure', uv: 'sensor.uv', radiation: 'sensor.radiation' }, tiles: ['humidity', 'wind', 'rain', 'pressure'], days: 5 }] },
    people: { w: 440, cards: [{ type: 'custom:ccu-people-card', people: ['person.ana', 'person.maria', 'person.alex'] }, { type: 'custom:ccu-people-card', layout: 'family', title: 'Family', people: ['person.ana', 'person.maria', 'person.alex'] }] },
    vehicles: { w: 440, cards: [{ type: 'custom:ccu-vehicle-card', title: 'Vehicles', alert_days: 3, vehicles: [
      { name: 'Family car', plate: 'AB 12 XYZ', icon: 'mdi:car', documents: [{ label: 'Insurance', entity: 'input_datetime.car_insurance', icon: 'mdi:shield-car' }, { label: 'Inspection', entity: 'input_datetime.car_inspection', icon: 'mdi:car-wrench' }, { label: 'Road tax', entity: 'input_datetime.car_road_tax', icon: 'mdi:highway' }, { label: 'Service', entity: 'sensor.car_service_date' }, { label: 'Oil', odometer: 'sensor.car_odometer', last_km: 'input_number.car_oil_km', interval_km: 10000, icon: 'mdi:oil' }] },
      { name: 'Van', icon: 'mdi:van-utility', documents: [{ label: 'Insurance', entity: 'input_datetime.van_insurance', icon: 'mdi:shield-car' }, { label: 'Inspection', entity: 'input_datetime.van_inspection', icon: 'mdi:car-wrench' }, { label: 'Road tax', entity: 'input_datetime.van_road_tax', icon: 'mdi:highway' }] },
    ] }] },
    // header + hero tile (big value, change vs. before, sparkline)
    hero: { w: 480, cards: [
      { type: 'custom:ccu-header-card', header: { icon: 'home', values: [{ entity: 'sensor.living_temperature', icon: 'thermo', color: 'accent' }, { entity: 'sensor.solar_power', icon: 'bolt', color: 'on' }, { entity: 'sensor.battery_soc', icon: 'battery', color: 'ok' }] } },
      { type: 'custom:ccu-buttons-card', columns: 1, entities: [{ entity: 'sensor.house_power', name: 'House consumption', icon: 'mdi:home', size: 'xl', active: true, delta: { entity: 'sensor.house_delta' }, spark: { hours: 6 } }] },
    ] },
    // the same animations as in a dashboard, each tile "on"; docs/demo/capture.mjs records them into docs/img/animated-icons.png
    animated: { w: 440, cards: [
      { type: 'custom:ccu-chips-card', entities: [{ entity: 'climate.living_ac', name: 'A/C cooling', icon: 'mdi:air-conditioner' }, { entity: 'sensor.washer_status', name: 'Washer', icon: 'mdi:washing-machine', on_states: ['spinning'] }] },
      { type: 'custom:ccu-buttons-card', columns: 4, density: 's', entities: [
        { entity: 'light.kitchen', name: 'Light', icon: 'mdi:lightbulb' }, { entity: 'fan.ventilation', name: 'Fan', icon: 'mdi:fan' }, { entity: 'switch.gas_heater', name: 'Heating', icon: 'mdi:fire' }, { entity: 'switch.ev_charger', name: 'Charging', icon: 'mdi:flash' },
        { entity: 'switch.pool_pump', name: 'Pump', icon: 'mdi:water' }, { entity: 'switch.solar_inverter', name: 'Solar', icon: 'mdi:white-balance-sunny' }, { entity: 'media_player.living_tv', name: 'Speaker', icon: 'mdi:speaker' }, { entity: 'lock.front_door', name: 'Door', icon: 'mdi:lock' }] },
    ] },
    nav: { w: 520, cards: [
      { type: 'custom:ccu-nav-card', spacer: false, items: [{ icon: 'home', label: 'Home', path: '/demo', match: location.pathname }, { icon: 'sun', label: 'Solar', path: '/solar' }, { icon: 'bulb', label: 'Lights', path: '/lights', badge: ['sensor.lights_on'], badge_style: 'light' }, { icon: 'camera', label: 'Cams', path: '/cams', badge: ['binary_sensor.cam1_person', 'binary_sensor.cam2_person'] }, { icon: 'audi', label: 'Car', path: '/car' }, { icon: 'warehouse', label: 'Shed', path: '/shed' }, { icon: 'pool', label: 'Pool', path: '/pool' }] },
      { type: 'custom:ccu-nav-card', compact: true, spacer: false, items: [{ back: true, icon: 'back', label: 'Back' }, { icon: 'tablet', label: 'Tablet', path: '/tablet' }, { icon: 'home', label: 'Home', path: '/demo', match: location.pathname }] },
    ] },
    layout: { w: 440, cards: [
      { type: 'custom:ccu-title-card', title: 'Kitchen', subtitle: 'Climate · lights', icon: 'pot' },
      { type: 'custom:ccu-header-card', header: { icon: 'home', values: [{ entity: 'sensor.house_power', icon: 'bolt', color: 'accent', label: 'Load' }, { entity: 'sensor.solar_power', icon: 'sun', color: 'on', label: 'Solar' }, { entity: 'sensor.battery_soc', icon: 'battery', color: 'ok', label: 'Battery' }], right: { entity: 'sensor.temp', label: 'outside' } } },
      { type: 'custom:ccu-nav-card', compact: true, spacer: false, items: [{ back: true, icon: 'back', label: 'Back' }, { icon: 'home', label: 'Home', path: '/home' }, { icon: 'sun', label: 'Solar', path: '/solar' }, { icon: 'camera', label: 'Cams', path: '/cams' }] },
    ] },
  };
  // the same mini-dashboard in every theme (docs/img/themes.png)
  const themeCards = (preset) => [
    { type: 'custom:ccu-header-card', preset, header: { icon: 'home', values: [{ entity: 'sensor.house_power', icon: 'bolt', color: 'accent', label: 'Load' }, { entity: 'sensor.solar_power', icon: 'sun', color: 'on', label: 'Solar' }], right: { entity: 'sensor.temp', label: 'outside' } } },
    { type: 'custom:ccu-chips-card', preset, entities: [BTN('climate.living_ac', 'A/C', 'mdi:air-conditioner'), BTN('light.pool', 'Pool light', 'mdi:lightbulb'), BTN('binary_sensor.bedroom_window', 'Window', 'mdi:window-open', { on_as: 'alert' })] },
    { type: 'custom:ccu-buttons-card', preset, columns: 2, entities: [BTN('light.kitchen', 'Kitchen', 'mdi:pot-steam'), BTN('light.bedroom', 'Bedroom', 'mdi:bed-double'), BTN('lock.front_door', 'Front door', 'mdi:lock'), BTN('binary_sensor.bedroom_window', 'Window', 'mdi:window-open', { on_as: 'alert' })] },
    { type: 'custom:ccu-battery-card', preset, soc: 'sensor.battery_soc', capacity_kwh: 10, load: 'sensor.load_power', grid_present: 'binary_sensor.grid_present', reserve_pct: 20, shutdown_pct: 10 },
  ];
  window.CCU_DEMO = { makeHass, scenes, themeCards, PRESETS: ['green', 'calm', 'contrast', 'mono', 'warm', 'light'] };
})();
