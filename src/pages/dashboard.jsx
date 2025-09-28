import { Icon, ICON_NAMES } from '../components/icons';
import { Table } from '../components/ui';

const Dashboard = () => {
  // Sample statistics
  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12%',
      changeType: 'increase',
      icon: ICON_NAMES.USER,
      color: 'blue'
    },
    {
      title: 'Total Products',
      value: '1,234',
      change: '+5%',
      changeType: 'increase',
      icon: ICON_NAMES.PRODUCT,
      color: 'green'
    },
    {
      title: 'Active Projects',
      value: '89',
      change: '+23%',
      changeType: 'increase',
      icon: ICON_NAMES.TRENDING_UP,
      color: 'purple'
    },
    {
      title: 'Revenue',
      value: '$54,321',
      change: '+8%',
      changeType: 'increase',
      icon: ICON_NAMES.DOLLAR_SIGN,
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

  // Table configuration for recent users
  const recentUsersColumns = [
    {
      key: 'name',
      header: 'Employee',
      className: 'text-text-primary font-medium',
      mobileLabel: true,
      mobileSubtext: (user) => user.employeeId
    },
    {
      key: 'role',
      header: 'Role',
      hideOnMobile: true
    },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      badgeConfig: {
        'Active': {
          color: 'var(--color-success)',
          backgroundColor: 'var(--color-success-light)'
        },
        'Inactive': {
          color: 'var(--color-error)',
          backgroundColor: 'var(--color-error-light)'
        }
      }
    }
  ];

  const recentUsersActions = [
    {
      icon: ICON_NAMES.EYE,
      onClick: (user) => console.log('View user:', user),
      variant: 'ghost',
      size: 'xs',
      textColor: 'var(--color-primary)',
      hoverBackgroundColor: 'var(--color-primary-light)',
      title: 'View',
      className: 'p-1'
    },
    {
      icon: ICON_NAMES.EDIT,
      onClick: (user) => console.log('Edit user:', user),
      variant: 'ghost',
      size: 'xs',
      textColor: 'var(--color-success)',
      hoverBackgroundColor: 'var(--color-success-light)',
      title: 'Edit',
      className: 'p-1'
    },
    {
      icon: ICON_NAMES.TRASH_2,
      onClick: (user) => console.log('Delete user:', user),
      variant: 'ghost',
      size: 'xs',
      textColor: 'var(--color-error)',
      hoverBackgroundColor: 'var(--color-error-light)',
      title: 'Delete',
      className: 'p-1'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-primary',
      green: 'text-success',
      purple: 'text-primary',
      yellow: 'text-warning'
    };
    return colors[color] || colors.blue;
  };

  const getColorStyles = (color) => {
    const colors = {
      blue: { backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' },
      green: { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' },
      purple: { backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' },
      yellow: { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }
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
                  stat.changeType === 'increase' ? 'text-success' : 'text-error'
                }`} style={{ color: stat.changeType === 'increase' ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`} style={getColorStyles(stat.color)}>
                <Icon name={stat.icon} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Recent Users</h2>
                <button className="text-sm font-medium hover:opacity-75 transition-opacity" style={{ color: 'var(--color-primary)' }}>
                  View All
                </button>
              </div>
            </div>
            <div className="overflow-hidden">
              <Table
                data={recentUsers}
                columns={recentUsersColumns}
                actions={recentUsersActions}
                showPagination={false}
                className="shadow-none border-0 rounded-none"
                headerClassName="bg-background"
              />
            </div>
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
              <button 
                className="w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Add New User
              </button>
              <button 
                className="w-full px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-75"
                style={{ 
                  borderColor: 'var(--color-border)', 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-light)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Generate Report
              </button>
              <button 
                className="w-full px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-75"
                style={{ 
                  borderColor: 'var(--color-border)', 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary-light)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
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