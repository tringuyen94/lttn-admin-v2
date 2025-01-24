
import ProductTable from '../components/ProductTable';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import Title from '../components/Title';
import { Fragment } from 'react';


const ProductList = () => {
   const { items, status } = useSelector(state => state.products)

   if (status === 'loading') {
      return <div>Loading...</div>; // Fallback loading component
   }


   return (
      <Fragment>
         <Title />
         <ProductTable products={items} />
      </Fragment>
   );
};

export default ProductList;