import styles from "./Pomodoro.module.css";
import {useState, useRef, useEffect, useContext} from "react";
import {BoardsContext} from "../../../BoardsContext";
import ButtonPane from "../../ButtonPane/ButtonPane";
import ActionButton from "../../ButtonPane/ActionButton/ActionButton";
import CrossButton from "../../ButtonPane/CrossButton/CrossButton";

export default function Pomodoro({widgetModel}) {
    const {removeWidget, updateWidget} = useContext(BoardsContext);
    return (
        <div className = {styles.pomodoro}>
            <ButtonPane>
                <ActionButton
                    className = "pomodoro"
                />
                <CrossButton
                    onClick={() => removeWidget(widgetModel.id)}
                    className = "pomodoro"
                />
            </ButtonPane>
            <div className ={styles.content}>

            </div>
        </div>
    )
}