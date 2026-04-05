import styles from './Weather.module.css'
import CrossButton from '../../ButtonPane/CrossButton/CrossButton';
import {weatherApi} from '../../../api/weatherApi'
import {useState, useMemo, useContext} from 'react'; 
import AsyncSelect from 'react-select/async';
import { SingleValue, ActionMeta, StylesConfig } from 'react-select';
import WeatherContainer from './WeatherContainer/WeatherContainer';
import { debounce } from 'lodash-es';
import ButtonPane from "../../ButtonPane/ButtonPane";
import { BoardsContext } from '../../../BoardsContext';
import { WidgetModel } from '../../../models/widgetModel';

interface Option {
    label: string;
    value: string;
    lat: number;
    lon: number;
    timezone: string;
}

interface City {
    name: string;
    lat: number;
    lon: number;
    timezone: string;
}   

export default function Weather({widgetModel} : {readonly widgetModel: WidgetModel}) {
    const {updateWidget, removeWidget} = useContext(BoardsContext);

     const [value, setValue] = useState<SingleValue<Option>>(
        widgetModel.data.city
            ? { label: widgetModel.data.city, value: widgetModel.data.city } as Option
            : null
    );
    const loadOptions = useMemo(() => {
        return debounce((inputValue: string, callback: (options: Option[]) => void) => {
            (async () => {
                const cities = await weatherApi.searchCity(inputValue.trim());
                callback(cities.map((city: City): Option => ({
                    label: city.name,
                    value: city.name,
                    lat: city.lat,
                    lon: city.lon,
                    timezone: city.timezone
                })));
            })();
        }, 500);
    }, []);

    async function handleChange(option: SingleValue<Option>, actionMeta: ActionMeta<Option>) {
        if (!option) {
            setValue(null);
            return;
        }
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

    const selectStyle: StylesConfig<Option, false> = {
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
            borderRadius: "15px",
        })
    }

    return (
        <div className={`${styles.weather} widgetContainer`}>
            <ButtonPane>
                <CrossButton 
                    onClick = {() => removeWidget(widgetModel.id)}
                    className="weather"
                /> 
            </ButtonPane>
            <div className={`${styles.content} widgetContent`}>
                <AsyncSelect<Option, false>
                    value = {value}
                    loadOptions = {loadOptions}
                    onChange = {handleChange}
                    placeholder="Search city"
                    isClearable
                    className={`${styles.select} allow-interaction`}
                    classNamePrefix="select"
                    noOptionsMessage={() => null}

                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                    }}
                    styles = {selectStyle}
                />
                <WeatherContainer
                    widgetModel={widgetModel}
                />
            </div>
        </div>
    )
}