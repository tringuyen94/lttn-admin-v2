// src/components/Dashboard.js

import { Fragment } from 'react';
import DashboardCard from './DashboardCard';
import { useSelector } from 'react-redux';
import Title from './Title';
const Dashboard = () => {
   const productCount = useSelector(state => state.products.items.length)
   const brandCount = useSelector(state => state.brands.items.length)
   const categoryCount = useSelector(state => state.categories.items.length)
   const projectCount = useSelector(state => state.projects.items.length)
   return (
      <Fragment>
         <Title title="Trang chủ" />
         <div className="pt-24 pl-80 pr-5 space-y-4">
            <div className="flex space-x-4">
               <DashboardCard title="Sản phẩm" value={productCount} />
               <DashboardCard title="Dự án" value={projectCount} />
               <DashboardCard title="Hãng" value={brandCount} />
               <DashboardCard title="Loại" value={categoryCount} />
            </div>
         </div>
      </Fragment>
   );
};

export default Dashboard;