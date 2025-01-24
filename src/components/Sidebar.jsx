// src/components/Sidebar.js

import { FaHome, FaBox, FaProjectDiagram, FaTags, FaIndustry, FaCog, FaPlus } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
const LINKS = [
   { path: "/", name: 'Home', icon: <FaHome /> },
   { path: "/danh-sach-san-pham", name: 'Danh sách sản phẩm', icon: <FaBox /> },
   { path: "/them-san-pham", name: 'Thêm sản phẩm', icon: <FaPlus /> },
   { path: "/du-an-thi-cong", name: 'Dự án thi công', icon: <FaProjectDiagram /> },
   { path: "/hang", name: 'Hãng', icon: <FaTags /> },
   { path: "/loai-san-pham", name: 'Loại sản phẩm', icon: <FaIndustry /> },
   { path: "/cap-nhat-mat-khau", name: 'Mật khẩu', icon: <FaCog /> }
]
const Sidebar = () => {
   return (
      <div className="w-64 bg-gray-800 text-white h-screen p-5 fixed">
         <h2 className="text-2xl font-bold text-red-600 mb-8">Dashboard</h2>
         <ul className="space-y-6">
            {LINKS.map(link => {
               return (
                  <li className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded cursor-pointer" key={link.path}>
                     {link.icon}  <NavLink to={link.path}
                        className={({ isActive }) =>
                           isActive ? 'text-red-600 font-bold' : ''
                        }>{link.name}</NavLink>
                  </li>
               )
            })}
         </ul>
      </div >
   );
};

export default Sidebar;