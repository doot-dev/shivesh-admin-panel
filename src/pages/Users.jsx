import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample user data based on the image
  const users = [
    {
      id: 1,
      sno: '01',
      employeeName: 'Aniket Deshmukh',
      role: 'Field technician',
      employeeId: 'EMP01',
      username: 'aniketg123',
      password: 'aniket_465',
      status: 'Active'
    },
    {
      id: 2,
      sno: '02',
      employeeName: 'Aniket Deshmukh',
      role: 'Field technician',
      employeeId: 'EMP01',
      username: 'aniketg123',
      password: 'aniket_465',
      status: 'Active'
    },
    {
      id: 3,
      sno: '03',
      employeeName: 'Aniket Deshmukh',
      role: 'Field technician',
      employeeId: 'EMP01',
      username: 'aniketg123',
      password: 'aniket_465',
      status: 'Inactive'
    },
    {
      id: 4,
      sno: '04',
      employeeName: 'Aniket Deshmukh',
      role: 'Field technician',
      employeeId: 'EMP01',
      username: 'aniketg123',
      password: 'aniket_465',
      status: 'Active'
    },
    {
      id: 5,
      sno: '05',
      employeeName: 'Aniket Deshmukh',
      role: 'Field technician',
      employeeId: 'EMP01',
      username: 'aniketg123',
      password: 'aniket_465',
      status: 'Inactive'
    },
    {
      id: 6,
      sno: '06',
      employeeName: 'Aniket Deshmukh',
      role: 'Field technician',
      employeeId: 'EMP01',
      username: 'aniketg123',
      password: 'aniket_465',
      status: 'Active'
    },
    {
      id: 7,
      sno: '07',
      employeeName: 'Aniket Deshmukh',
      role: 'Field technician',
      employeeId: 'EMP01',
      username: 'aniketg123',
      password: 'aniket_465',
      status: 'Active'
    }
  ];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const handleEdit = (user) => {
    console.log('Edit user:', user);
  };

  const handleDelete = (user) => {
    console.log('Delete user:', user);
  };

  const handleView = (user) => {
    console.log('View user:', user);
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inactive
        </span>
      );
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Users</h1>
        <p className="text-gray-600">View and manage user details</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Role</option>
              <option value="Field technician">Field technician</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Add User Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile Cards View - Hidden on desktop */}
        <div className="md:hidden">
          {users.map((user) => (
            <div key={user.id} className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{user.employeeName}</h3>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
                {getStatusBadge(user.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">ID:</span> {user.employeeId}
                </div>
                <div>
                  <span className="text-gray-500">Username:</span> {user.username}
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleView(user)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(user)}
                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.sno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.employeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.password}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 md:px-6 py-3 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span className="hidden sm:inline">Showing 1 to 6 of 30 results</span>
              <span className="sm:hidden">1-6 of 30</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;