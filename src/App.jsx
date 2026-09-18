import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import Layout from "./components/Layout";
import DashboardHome from "./pages/DashboardHome";
import ResourceListPage from "./pages/ResourceListPage";
import ResourceFormPage from "./pages/ResourceFormPage";

export default function App() {
  return (
    <AuthProvider>
      <RequireAuth>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardHome />} />
            <Route path=":resourceKey" element={<ResourceListPage />} />
            <Route path=":resourceKey/:id" element={<ResourceFormPage />} />
          </Route>
        </Routes>
      </RequireAuth>
    </AuthProvider>
  );
}
