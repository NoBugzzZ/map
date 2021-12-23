import { useRoutes } from 'hookrouter';
import { HomePage, Map, NotFoundPage,GantryPage } from './pages';

const routes = {
  '/': () => <HomePage />,
  '/vehicle': () => <Map />,
  '/gantry': () => <GantryPage />
};

const Route = () => {
  const routeResult = useRoutes(routes);

  return routeResult || <NotFoundPage />;
}

export default Route