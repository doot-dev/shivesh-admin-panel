import { Users, Package, TrendingUp, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';

const Dashboard = () => {
  // Sample statistics
  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Products',
      value: '1,234',
      change: '+5%',
      changeType: 'increase',
      icon: Package,
      color: 'green'
    },
    {
      title: 'Active Projects',
      value: '89',
      change: '+23%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Revenue',
      value: '$54,321',
      change: '+8%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  // Sample recent users
  const recentUsers = [
    {
      id: 1,
      name: 'Aniket Deshmukh',
      role: 'Field technician',
      employeeId: 'EMP01',
      status: 'Active',
      joinedDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Manager',
      employeeId: 'EMP02',
      status: 'Active',
      joinedDate: '2024-01-14'
    },
    {
      id: 3,
      name: 'Rahul Kumar',
      role: 'Developer',
      employeeId: 'EMP03',
      status: 'Inactive',
      joinedDate: '2024-01-13'
    },
    {
      id: 4,
      name: 'Sneha Patel',
      role: 'Designer',
      employeeId: 'EMP04',
      status: 'Active',
      joinedDate: '2024-01-12'
    }
  ];

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

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      yellow: 'bg-yellow-50 text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium text-gray-900">2,431</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="text-sm font-medium text-gray-900">124</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Projects</span>
                <span className="text-sm font-medium text-gray-900">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-sm font-medium text-gray-900">$54,321</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Add New User
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Generate Report
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;