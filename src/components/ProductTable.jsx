import { Fragment, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useDispatch } from 'react-redux';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { toast } from 'react-toastify';
import { deleteProduct } from '../redux/slices/productSlice';



const ProductTable = ({ products }) => {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [productToDelete, setProductToDelete] = useState(null);

   const handleModalClose = () => {
      setIsModalOpen(false);
      setProductToDelete(null);
   };


   const ActionCellRenderer = ({ data }) => {
      const handleDeleteClick = () => {
         setProductToDelete(data._id);
         setIsModalOpen(true);
      };


      const handleUpdate = () => {
         navigate(`/san-pham/cap-nhat-san-pham/${data._id}`)
      }

      return (
         <Fragment>
            <div className="flex">
               <button
                  onClick={handleUpdate}
                  className="flex items-center bg-blue-500 text-white px-2 py-1 rounded mr-2"
               >
                  <FaEdit />
               </button>
               <button
                  onClick={handleDeleteClick}
                  className="flex items-center bg-red-500 text-white px-2 py-1 rounded"
               >
                  <FaTrash />
               </button>
            </div>
         </Fragment>
      );
   };

   const handleDeleteConfirm = async () => {
      if (!productToDelete) return;
      try {
         // Delete the product from API
         await dispatch(deleteProduct(productToDelete)).unwrap()
         setIsModalOpen(false);
         toast.success('Đã xoá')
      } catch (error) {
         toast.error(error)
      }
   };

   const columns = useMemo(() => [
      {
         headerName: 'Loại Sản Phẩm', field: 'category.category_name', filter: 'agSetColumnFilter', // Dropdown filter for category
         filterParams: {
            values: Array.from(new Set(products.map((product) => product.category))),
            // Extract unique categories for filter options
         },
      },
      { headerName: 'Tên Sản Phẩm', field: 'product_name', filter: 'agTextColumnFilter', },
      {
         headerName: 'Mới/Cũ',
         field: 'product_isnew',
         filter: 'agTextColumnFilter',
         valueFormatter: (params) => {
            return params.value ? 'Mới' : 'Cũ';  // Display "Mới" or "Cũ" based on value
         }
      },
      {
         headerName: 'Hãng', field: 'brand.brand_name', filter: 'agSetColumnFilter', filterParams: {
            values: Array.from(new Set(products.map((product) => product.brand.brand_name))),
            // Extract unique brand names for filter options
         }
      },
      { headerName: 'Ngày Tạo', field: 'createdAt', valueFormatter: ({ value }) => new Date(value).toLocaleString('vi-VN') },
      {
         headerName: 'Actions',
         field: 'actions',
         cellRenderer: ActionCellRenderer
      },
   ], [products]);

   return (
      <div className="ag-theme-alpine" style={{ height: "100vh", width: '100%' }}>
         <AgGridReact
            rowData={products}
            columnDefs={columns}
            pagination={true}
            paginationPageSize={20}

         />
         <Modal isOpen={isModalOpen}
            onClose={handleModalClose}
            onConfirm={handleDeleteConfirm}
            productName={productToDelete ? productToDelete.name : ''} />
      </div>
   );
};

export default ProductTable;