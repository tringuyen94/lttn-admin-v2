// src/components/DashboardCard.js


const DashboardCard = ({ title, value }) => {
   return (
      <div className="bg-white p-5 rounded-lg shadow-md text-center flex-1">
         <h3 className="text-xl font-semibold mb-2">{title}</h3>
         <p className="text-2xl font-bold">{value}</p>
      </div>
   );
};

export default DashboardCard;