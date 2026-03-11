import DashBoardLayout from "./layout/DashboardLayout/DashboardLayout";
import {BoardsProvider} from "./BoardsProvider";
import {useEffect} from "react";  
import alertSound from './assets/alert.mp3';

export default function App() {
  return (
    <BoardsProvider>
      <DashBoardLayout/>
    </BoardsProvider>
  )
}

