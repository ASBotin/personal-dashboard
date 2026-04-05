import DashBoardLayout from "./layout/DashboardLayout";
import {BoardsProvider} from "./BoardsProvider";


export default function App() {
  return (
    <BoardsProvider>
      <DashBoardLayout/>
    </BoardsProvider>
  )
}

