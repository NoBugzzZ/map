import { useRoutes } from 'hookrouter';
import { HomePage, Map, NotFoundPage, GantriesGraph } from './pages';

const routes = {
  '/': () => <HomePage />,
  '/map': () => <Map />,
  '/gantries': () => <GantriesGraph />
};

const Route = () => {
  const routeResult = useRoutes(routes);

  return routeResult || <NotFoundPage />;
}

export default Route