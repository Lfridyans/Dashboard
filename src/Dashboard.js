import React, { useState } from 'react';
import { Database, BarChart2, Edit, Search, X, CheckCircle, Menu, Upload } from 'lucide-react';

const airportData = {
  "CGK": { pax: 7, traffic: 5, runway: 1 },
  "DPS": { pax: 6, traffic: 3, runway: 2 },
  "SUB": { pax: 5, traffic: 7, runway: 1.2 },
  "UPG": { pax: 4, traffic: 7, runway: 1.4 },
};

const Dashboard = () => {
  const [activeContent, setActiveContent] = useState('database');
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [resultsData, setResultsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    airport: '',
    grade: '',
    pax: '',
    traffic: '',
    runway: '',
  });
  const [activeTab, setActiveTab] = useState('manual');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const menuItems = [
    { id: 'database', icon: <Database className="w-5 h-5" />, label: 'Database' },
    { id: 'results', icon: <BarChart2 className="w-5 h-5" />, label: 'Results' },
    { id: 'input', icon: <Edit className="w-5 h-5" />, label: 'Input Data' }
  ];

  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleGenerateScore = () => {
    if (selectedRows.length === 0) {
      showSuccessNotification("Silahkan pilih data yang akan di-generate scorenya!");
    } else {
      setIsLoading(true);
      setTimeout(() => {
        const updatedResults = selectedRows.map(rowId => {
          const item = data.find(d => d.id === rowId);
          if (item) {
            const score = calculateScore(item);
            return { ...item, score };
          }
          return null;
        }).filter(Boolean);

        setResultsData([...resultsData, ...updatedResults]);
        setIsLoading(false);
        setSelectedRows([]);
        showSuccessNotification("Score berhasil di-generate dan ditambahkan ke Results!");
        setActiveContent("results");
      }, 2000);
    }
  };

  const calculateScore = (item) => {
    const paxScore = item.pax * 0.25;
    const trafficScore = item.traffic * 0.20;
    const runwayScore = item.runway * 0.20;
    return (paxScore + trafficScore + runwayScore).toFixed(2);
  };

  const handleAirportChange = (e) => {
    const airport = e.target.value;
    if (airportData[airport]) {
      const { pax, traffic, runway } = airportData[airport];
      setFormValues(prevValues => ({
        ...prevValues,
        airport,
        pax,
        traffic,
        runway,
      }));
    } else {
      setFormValues(prevValues => ({
        ...prevValues,
        airport: '',
        pax: '',
        traffic: '',
        runway: '',
      }));
    }
  };

  const handleAddData = (e) => {
    e.preventDefault();
    const newData = {
      id: Date.now(),
      ...formValues,
      parameters: []
    };
    setData([...data, newData]);
    setFormValues({ name: '', airport: '', grade: '', pax: '', traffic: '', runway: '' });
    showSuccessNotification('Data berhasil disimpan!');
    setActiveContent('database');
  };

  const handleEditData = (e) => {
    e.preventDefault();
    const updatedData = data.map(item =>
      item.id === editData.id ? { ...item, ...formValues } : item
    );
    setData(updatedData);
    setShowModal(false);
    setEditData(null);
    showSuccessNotification('Data berhasil diperbarui!');
  };

  const handleDeleteData = (id) => {
    setData(data.filter(item => item.id !== id));
    showSuccessNotification('Data berhasil dihapus!');
  };

  const openEditModal = (item) => {
    setEditData(item);
    setFormValues(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditData(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = data.map(item => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(rowId => rowId !== id) : [...prevSelected, id]
    );
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.airport.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(item.grade).includes(searchQuery)
  );

  const Notification = ({ message }) => (
    <div className={`fixed top-4 right-4 flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 transition-opacity duration-500 ${showNotification ? 'opacity-100' : 'opacity-0'}`}>
      <CheckCircle className="w-5 h-5 mr-2" />
      <span>{message}</span>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {showNotification && <Notification message={notificationMessage} />}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-4">Generating Scores...</h3>
            <div className="loader"></div>
          </div>
        </div>
      )}

      {/* Navbar Mobile */}
      <header className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <button onClick={() => setIsNavbarOpen(!isNavbarOpen)}>
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      </header>

      {/* Sidebar */}
      <div className={`w-full lg:w-64 bg-white shadow-lg ${isNavbarOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4">
          <h1 className="text-xl font-bold mb-8">Dashboard</h1>
          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveContent(item.id); setIsNavbarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg ${
                  activeContent === item.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex flex-col lg:flex-row lg:justify-between items-center">
          <h2 className="text-xl font-semibold mb-2 lg:mb-0">{menuItems.find(i => i.id === activeContent)?.label}</h2>
          {(activeContent === 'database') && (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </header>

        <main className="p-4 sm:p-6">
          {activeContent === 'database' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 flex justify-between items-center border-b">
                <h3 className="font-semibold">Database Content</h3>
                <button 
                  onClick={handleGenerateScore}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Score
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
  {filteredData.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      Belum ada data tersimpan atau tidak ada hasil pencarian.
    </div>
  ) : (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2 text-left font-semibold border">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedRows.length === data.length}
              />
            </th>
            <th className="px-4 py-2 text-left font-semibold border">Name</th>
            <th className="px-4 py-2 text-left font-semibold border">Airport</th>
            <th className="px-4 py-2 text-left font-semibold border">Grade</th>
            <th className="px-4 py-2 text-left font-semibold border">Pax</th>
            <th className="px-4 py-2 text-left font-semibold border">Traffic</th>
            <th className="px-4 py-2 text-left font-semibold border">Runway</th>
            <th className="px-4 py-2 text-left font-semibold border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(item.id)}
                  onChange={() => handleRowSelect(item.id)}
                />
              </td>
              <td className="px-4 py-2 border">{item.name}</td>
              <td className="px-4 py-2 border">{item.airport}</td>
              <td className="px-4 py-2 border">{item.grade}</td>
              <td className="px-4 py-2 border">{item.pax}</td>
              <td className="px-4 py-2 border">{item.traffic}</td>
              <td className="px-4 py-2 border">{item.runway}</td>
              <td className="px-4 py-2 border flex space-x-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteData(item.id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

            </div>
          )}

{activeContent === 'results' && (
    <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Results Content</h3>
        {resultsData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
                Belum ada hasil yang di-generate.
            </div>
        ) : (
            <div className="overflow-x-auto"> {/* Membungkus tabel dengan div responsif */}
                <table className="w-full border-collapse">
                    <thead className="bg-blue-100">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold border">Name</th>
                            <th className="px-4 py-2 text-left font-semibold border">Airport</th>
                            <th className="px-4 py-2 text-left font-semibold border">Grade</th>
                            <th className="px-4 py-2 text-left font-semibold border">Pax</th>
                            <th className="px-4 py-2 text-left font-semibold border">Traffic</th>
                            <th className="px-4 py-2 text-left font-semibold border">Runway</th>
                            <th className="px-4 py-2 text-left font-semibold border">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultsData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">{item.name}</td>
                                <td className="px-4 py-2 border">{item.airport}</td>
                                <td className="px-4 py-2 border">{item.grade}</td>
                                <td className="px-4 py-2 border">{item.pax}</td>
                                <td className="px-4 py-2 border">{item.traffic}</td>
                                <td className="px-4 py-2 border">{item.runway}</td>
                                <td className="px-4 py-2 border">{item.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
)}


          {activeContent === 'input' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6 border-b">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('manual')}
                    className={`pb-2 px-4 ${activeTab === 'manual' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                  >
                    Manual Input
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`pb-2 px-4 ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {activeTab === 'manual' ? (
                <form onSubmit={handleAddData} className="space-y-4">
                  <div>
                    <label className="block mb-1">Name</label>
                    <input
                      name="name"
                      value={formValues.name}
                      onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Airport</label>
                    <select
                      name="airport"
                      value={formValues.airport}
                      onChange={handleAirportChange}
                      className="w-full border rounded-lg p-2"
                      required
                    >
                      <option value="">Select Airport</option>
                      {Object.keys(airportData).map(code => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Grade</label>
                    <select
                      name="grade"
                      value={formValues.grade}
                      onChange={(e) => setFormValues({ ...formValues, grade: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    >
                      <option value="">Select Grade</option>
                      {Array.from({ length: 23 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Pax</label>
                      <input
                        type="number"
                        value={formValues.pax || ''}
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Traffic</label>
                      <input
                        type="number"
                        value={formValues.traffic || ''}
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Runway</label>
                      <input
                        type="number"
                        value={formValues.runway || ''}
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Save Data
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Upload File (CSV only)
                      </label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={() => alert("Upload functionality not implemented yet")}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Edit Data</h3>
                <form onSubmit={handleEditData} className="space-y-4">
                  <div>
                    <label className="block mb-1">Name</label>
                    <input
                      name="name"
                      value={formValues.name}
                      onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Airport</label>
                    <select
                      name="airport"
                      value={formValues.airport}
                      onChange={handleAirportChange}
                      className="w-full border rounded-lg p-2"
                      required
                    >
                      <option value="">Select Airport</option>
                      {Object.keys(airportData).map(code => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Grade</label>
                    <select
                      name="grade"
                      value={formValues.grade}
                      onChange={(e) => setFormValues({ ...formValues, grade: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    >
                      <option value="">Select Grade</option>
                      {Array.from({ length: 23 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Pax</label>
                      <input
                        type="number"
                        value={formValues.pax || ''}
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Traffic</label>
                      <input
                        type="number"
                        value={formValues.traffic || ''}
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Runway</label>
                      <input
                        type="number"
                        value={formValues.runway || ''}
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg mt-2 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
