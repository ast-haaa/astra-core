UPDATE alert_template SET 
    template_hi = 'तापमान अधिक है: {value}°C',
    template_mr = 'तापमान जास्त आहे: {value}°C',
    template_gu = 'તાપમાન વધારે છે: {value}°C'
WHERE code = 'TEMP_HIGH';

UPDATE alert_template SET 
    template_hi = 'तापमान बहुत कम है: {value}°C',
    template_mr = 'तापमान खूप कमी आहे: {value}°C',
    template_gu = 'તાપમાન બહુ ઓછું છે: {value}°C'
WHERE code = 'TEMP_LOW';

UPDATE alert_template SET 
    template_hi = 'नमी अधिक है: {value}%',
    template_mr = 'आर्द्रता जास्त आहे: {value}%',
    template_gu = 'ભેજ વધારે છે: {value}%'
WHERE code = 'HUMIDITY_HIGH';

UPDATE alert_template SET 
    template_hi = 'नमी बहुत कम है: {value}%',
    template_mr = 'आर्द्रता खूप कमी आहे: {value}%',
    template_gu = 'ભેજ બહુ ઓછો છે: {value}%'
WHERE code = 'HUMIDITY_LOW';
