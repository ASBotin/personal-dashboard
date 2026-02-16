import styles from './WeatherWidget.module.css'
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';
import {weatherApi} from '../../../api/weatherApi'
import {useState, useMemo, useContext} from 'react'; 
import AsyncSelect from 'react-select/async';
import Weather from './Weather/Weather';
import { debounce } from 'lodash-es';
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import ButtonPane from "../../ButtonPane/ButtonPane";
import { BoardsContext } from '../../../BoardsContext';

export default function WeatherWidget({widgetModel}) {
    const {updateWidget, removeWidget} = useContext(BoardsContext);

     const [value, setValue] = useState(
        widgetModel.data.city
            ? { label: widgetModel.data.city, value: widgetModel.data.city }
            : null
    );
    const loadOptions = useMemo(() => {
        return debounce((inputValue, callback) => {
            (async () => {
                const cities = await weatherApi.searchCity(inputValue.trim());
                callback(cities.map(city => ({
                    label: city.name,
                    value: city.name,
                    lat: city.lat,
                    lon: city.lon,
                    timezone: city.timezone
                })));
            })();
        }, 500);
    }, []);

    async function handleChange(option) {
        setValue(option);
        updateWidget({
            ...widgetModel,
            data: { 
                ...widgetModel.data,
                city: option.value,
                lat: option.lat,
                lon: option.lon,
                timezone: option.timezone
            }
        })
    }

    const selectStyle = {
        control: (base) => ({
            ...base,
            border: "1px solid #2e313c3a",
            borderRadius: "15px",
            boxShadow: "none",
            background: "linear-gradient(180deg,rgba(168, 202, 247, 1) 0%, rgba(144, 182, 232, 1) 100%)",
            ':hover': {
                borderColor: "#2e313c"
            },
            cursor: "text",
        }),
        clearIndicator: (base) => ({
            ...base,
            color: "#2e313cd0",
            cursor: "pointer",
            '&:hover': {
                color: "#2e313c",
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#a8ceff",
            border: "1px solid #4544491a",
            borderRadius: "15px",
            boxShadow: "none",
            color: "#2e313c",
            marginTop: "4px",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: "transparent",
            color: state.isFocused ? "#000000" : "#2e313c",
            cursor: "pointer",
        })
    }

    return (
        <div className={styles.weatherWidget}>
            <ButtonPane>
                <ActionButton 
                    className="weather"
                />
                <CrossButton 
                    onClick = {() => removeWidget(widgetModel.id)}
                    className="weather"
                /> 
            </ButtonPane>
            <div className={styles.content}>
                <AsyncSelect
                    value = {value}
                    loadOptions = {loadOptions}
                    onChange = {handleChange}
                    placeholder="Search city"
                    isClearable
                    className={styles.select}
                    noOptionsMessage={() => null}

                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                    }}
                    styles = {selectStyle}
                />
                <Weather
                    className={styles.weather}
                    widgetModel={widgetModel}
                />
            </div>
        </div>
    )
}