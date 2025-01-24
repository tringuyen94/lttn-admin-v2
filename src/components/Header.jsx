import { useAuth } from '../context/AuthContext';


const Header = () => {
   const { logout } = useAuth()

   const handleLogout = async () => {
      await logout();
   };

   return (
      <div className="h-16 bg-slate-500 text-white flex items-center justify-between pl-80 pr-5 fixed w-full z-10">
         <h1 className="text-lg font-semibold">LTTN ELECTRIC DASHBOARD</h1>
         <button
            onClick={handleLogout}
            className='bg-slate-400 rounded-sm px-2 h-[40px] hover:bg-slate-700 transition-all ease-in'
         >
            Đăng xuất
         </button>
      </div>
   );
};

export default Header;