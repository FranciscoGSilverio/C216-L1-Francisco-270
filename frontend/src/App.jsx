import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ActorCreatePage from "./pages/ActorCreatePage";
import ActorEditPage from "./pages/ActorEditPage";
import ActorsPage from "./pages/ActorsPage";
import MovieCreatePage from "./pages/MovieCreatePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import MovieEditPage from "./pages/MovieEditPage";
import MoviesPage from "./pages/MoviesPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/filmes" replace />} />
        <Route path="filmes" element={<MoviesPage />} />
        <Route path="filmes/novo" element={<MovieCreatePage />} />
        <Route path="filmes/:id" element={<MovieDetailPage />} />
        <Route path="filmes/:id/editar" element={<MovieEditPage />} />
        <Route path="atores" element={<ActorsPage />} />
        <Route path="atores/novo" element={<ActorCreatePage />} />
        <Route path="atores/:id/editar" element={<ActorEditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
