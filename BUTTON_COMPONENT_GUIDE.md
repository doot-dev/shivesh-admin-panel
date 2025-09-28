# Universal Button Component

## 🎨 **Highly Customizable Button Component**

I've created a universal Button component that you can use throughout your application with extensive customization options.

## 📁 **Location**
- `src/components/ui/Button.jsx`
- Import: `import { Button } from '../components/ui';`

## 🚀 **Usage Examples**

### **Basic Buttons**
```jsx
import { Button } from '../components/ui';
import { ICON_NAMES } from '../components/icons';

// Simple button
<Button>Click Me</Button>

// Primary button with icon
<Button variant="primary" leftIcon={ICON_NAMES.PLUS}>
  Add User
</Button>

// Custom size and height
<Button size="lg" height="60px" width="200px">
  Large Button
</Button>
```

### **Size Variants**
```jsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### **Color Variants**
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Info</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
```

### **Custom Colors**
```jsx
<Button 
  backgroundColor="#8B5CF6" 
  textColor="white"
  hoverBackgroundColor="#7C3AED"
>
  Custom Purple
</Button>

<Button 
  textColor="#059669"
  borderColor="#059669"
  hoverBackgroundColor="#d1fae5"
  variant="outline"
>
  Custom Green Outline
</Button>
```

### **With Icons**
```jsx
// Left icon
<Button leftIcon={ICON_NAMES.PLUS} variant="primary">
  Add Item
</Button>

// Right icon
<Button rightIcon={ICON_NAMES.CHEVRON_RIGHT} variant="outline">
  Next Step
</Button>

// Icon only
<Button leftIcon={ICON_NAMES.EDIT} variant="ghost" />

// Custom icon size
<Button leftIcon={ICON_NAMES.USER} iconSize={20}>
  Profile
</Button>
```

### **Loading State**
```jsx
<Button loading variant="primary">
  Saving...
</Button>

<Button loading leftIcon={ICON_NAMES.PLUS}>
  Adding User...
</Button>
```

### **Custom Dimensions**
```jsx
<Button width="100%" height="50px">
  Full Width Button
</Button>

<Button width="200px" height="40px" variant="success">
  Fixed Size
</Button>
```

### **Rounded Variants**
```jsx
<Button rounded="none">Square</Button>
<Button rounded="sm">Small Radius</Button>
<Button rounded="md">Medium Radius</Button>
<Button rounded="lg">Large Radius (default)</Button>
<Button rounded="xl">Extra Large Radius</Button>
<Button rounded="full">Fully Rounded</Button>
```

### **Disabled & States**
```jsx
<Button disabled>Disabled Button</Button>
<Button loading>Loading...</Button>
```

## 🎛️ **All Available Props**

### **Content Props**
- `children` - Button text/content
- `leftIcon` - Icon on the left (icon name)
- `rightIcon` - Icon on the right (icon name)
- `iconSize` - Size of icons (default: 16)

### **Behavior Props**
- `onClick` - Click handler function
- `disabled` - Disable the button (boolean)
- `loading` - Show loading spinner (boolean)
- `type` - Button type ('button', 'submit', 'reset')

### **Size & Layout Props**
- `size` - Predefined sizes ('xs', 'sm', 'md', 'lg', 'xl')
- `width` - Custom width (e.g., '200px', '100%')
- `height` - Custom height (e.g., '50px', '60px')

### **Styling Props**
- `variant` - Color scheme ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost', 'outline')
- `rounded` - Border radius ('none', 'sm', 'md', 'lg', 'xl', 'full')
- `border` - Show border (boolean, default: true)
- `className` - Additional CSS classes

### **Custom Color Props**
- `backgroundColor` - Custom background color
- `textColor` - Custom text color
- `borderColor` - Custom border color
- `hoverBackgroundColor` - Background color on hover
- `hoverTextColor` - Text color on hover
- `hoverBorderColor` - Border color on hover

## 📋 **Real Examples from Your App**

### **Add User Button** (What we implemented)
```jsx
<Button
  onClick={() => setShowAddModal(true)}
  leftIcon={ICON_NAMES.PLUS}
  variant="primary"
  size="md"
  height="50px"
>
  Add User
</Button>
```

### **Action Buttons** (View, Edit, Delete)
```jsx
{/* View Button */}
<Button
  onClick={() => handleView(user)}
  variant="ghost"
  size="xs"
  leftIcon={ICON_NAMES.EYE}
  textColor="#2563eb"
  hoverBackgroundColor="#dbeafe"
  className="p-1"
  title="View"
/>

{/* Edit Button */}
<Button
  onClick={() => handleEdit(user)}
  variant="ghost"
  size="xs"
  leftIcon={ICON_NAMES.EDIT}
  textColor="#059669"
  hoverBackgroundColor="#d1fae5"
  className="p-1"
  title="Edit"
/>

{/* Delete Button */}
<Button
  onClick={() => handleDelete(user)}
  variant="ghost"
  size="xs"
  leftIcon={ICON_NAMES.TRASH_2}
  textColor="#dc2626"
  hoverBackgroundColor="#fee2e2"
  className="p-1"
  title="Delete"
/>
```

## 🎨 **Custom Button Examples**

### **CTA Button**
```jsx
<Button
  size="lg"
  width="300px"
  height="60px"
  backgroundColor="#8B5CF6"
  textColor="white"
  hoverBackgroundColor="#7C3AED"
  rounded="xl"
  leftIcon={ICON_NAMES.PLUS}
>
  Get Started Now
</Button>
```

### **Subtle Action Button**
```jsx
<Button
  variant="ghost"
  textColor="#6B7280"
  hoverBackgroundColor="#F3F4F6"
  hoverTextColor="#374151"
  rounded="full"
  className="px-6"
>
  Learn More
</Button>
```

### **Loading Button**
```jsx
<Button
  loading={isSubmitting}
  variant="success"
  width="100%"
  height="48px"
  disabled={!isValid}
>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```

## ✅ **Benefits**

- **✅ Consistent Design** - Same button component across all pages
- **✅ Highly Customizable** - Colors, sizes, icons, dimensions
- **✅ Accessible** - Built-in focus states and disabled handling
- **✅ Loading States** - Built-in spinner for async operations
- **✅ Icon Support** - Easy left/right icon integration
- **✅ Responsive** - Works great on all screen sizes
- **✅ TypeScript Ready** - Easy to add type definitions later

Your Button component is now ready to use throughout your application! 🎊