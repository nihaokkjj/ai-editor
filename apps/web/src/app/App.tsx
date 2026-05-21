import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { WorkspacePage } from "../pages/WorkspacePage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<WorkspacePage />} />
          <Route path="analysis" element={<WorkspacePage />} />
          <Route path="projects" element={<WorkspacePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
