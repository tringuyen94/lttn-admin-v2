import { Helmet } from 'react-helmet-async';

export default function Title({ title }) {
   return (
      <Helmet>
         <title>{title} | LTTN Admin</title>
      </Helmet>
   );
}
