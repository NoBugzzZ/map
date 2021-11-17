import { useRoutes } from 'hookrouter';
import { HomePage, Map, NotFoundPage } from './pages';

const routes = {
  '/': () => <HomePage />,
  '/map': () => <Map />
};

const Route = () => {
  const routeResult = useRoutes(routes);

  return routeResult || <NotFoundPage />;
}

export default Route