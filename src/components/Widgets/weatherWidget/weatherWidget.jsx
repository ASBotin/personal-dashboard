import styles from './WeatherWidget.module.css'
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';
import {weatherApi} from '../../../api/weatherApi'
import {useState, useMemo} from 'react'; 
import AsyncSelect from 'react-select/async';
import Weather from './Weather/Weather';
import { debounce } from 'lodash-es';
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import ButtonPane from "../../ButtonPane/ButtonPane";

export default function WeatherWidget({widgetModel, removeWidget, updateWidget}) {
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
            border: "1px solid #454449",
            borderRadius: "15px",
            boxShadow: "none",
            backgroundColor: "#D6E0E5",
            ':hover': {
                borderColor: "#908F8A"
            },
            cursor: "text",
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#D6E0E5",
            border: "1px solid #4544491a",
            borderRadius: "15px",
            boxShadow: "none",
            color: "#454449",
            marginTop: "4px",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: "transparent",
            color: state.isFocused ? "#000000" : "#454449",
            cursor: "pointer",
        })
    }

    return (
        <div className={styles.weatherWidget}>
            <ButtonPane>
                <ActionButton/>
                <CrossButton 
                    onClick = {() => removeWidget(widgetModel.id)}
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