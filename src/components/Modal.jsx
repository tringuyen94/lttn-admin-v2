import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm }) => {
   if (!isOpen) return null; // Don't render modal if not open

   return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-500 bg-opacity-50">
         <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h3 className="text-xl font-semibold text-center mb-4">Xác nhận xoá</h3>

            <div className="flex justify-around">
               <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
               >
                  Có, Xoá
               </button>
               <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
               >
                  Huỷ
               </button>
            </div>
         </div>
      </div>
   );
};

export default Modal;