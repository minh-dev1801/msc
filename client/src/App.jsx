import React from "react";
import PivotCharts from "./components/PivotChart";

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Thống Kê Dữ Liệu</h1>
      <PivotCharts />
    </div>
  );
};

export default App;
