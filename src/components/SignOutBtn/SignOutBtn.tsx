import styles from "./SignOutBtn.module.css";
import SignOutIcon from "../../assets/controls/sign-out.svg?react";

export default function SignOutBtn({onClick} : {readonly onClick: () => void}) {
    return (
        <button
            className={styles.signOutBtn}
            onClick={onClick}
            title="Выйти из аккаунта"
        >
            <SignOutIcon className={styles.signOutIcon}/>
        </button>
    )
}