import Clear_day from '../../../../assets/weatherIcons/clear_day.svg?react';
import Clear_night from '../../../../assets/weatherIcons/clear_night.svg?react';
import Cloudy from '../../../../assets/weatherIcons/cloudy.svg?react';
import Fog from '../../../../assets/weatherIcons/fog.svg?react';
import Partly_cloudy_day from '../../../../assets/weatherIcons/partly_cloudy_day.svg?react';
import Partly_cloudy_night from '../../../../assets/weatherIcons/partly_cloudy_night.svg?react';
import Rain from '../../../../assets/weatherIcons/rain.svg?react';
import Snow from '../../../../assets/weatherIcons/snow.svg?react';
import Thunderstorm from '../../../../assets/weatherIcons/thunderstorm.svg?react';
import Heavy_rain from '../../../../assets/weatherIcons/heavy_rain.svg?react';
import Drizzle from '../../../../assets/weatherIcons/drizzle.svg?react';
import Blizzard from '../../../../assets/weatherIcons/blizzard.svg?react';
import Hail from '../../../../assets/weatherIcons/hail.svg?react';
import Sleet from '../../../../assets/weatherIcons/sleet.svg?react';

export const weatherIcons = [
    {
        codes: [0],
        day: Clear_day,
        night: Clear_night
    },
    {
        codes: [1, 2],
        day: Partly_cloudy_day,
        night: Partly_cloudy_night
    },
    {
        codes: [3],
        icon: Cloudy
    },
    {
        codes: [45, 48],
        icon: Fog
    },
    {
        codes: [51, 53, 55],
        icon: Drizzle
    },
    {
        codes: [61, 63],
        icon: Rain
    },
    {
        codes: [65, 80, 81, 82],
        icon: Heavy_rain
    },
    {
        codes: [56, 57, 66, 67],
        icon: Sleet
    },
    {
        codes: [71, 73, 77, 85],
        icon: Snow
    },
    {
        codes: [75, 86],
        icon: Blizzard
    },
    {
        codes: [95],
        icon: Thunderstorm
    },
    {
        codes: [96, 99],
        icon: Hail
    },
]
