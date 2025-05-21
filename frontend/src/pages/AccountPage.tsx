'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/custom/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, CardInformation, Address } from '@/util/types'
import { Edit2, Save, CreditCard, Plus, Eye, EyeOff, User as UserIcon } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios from 'axios'
import ManageCards from '@/components/custom/ManageCards'

export default function AccountPage() {
  const nav = useNavigate()
  const { isAuthenticated, user, updateUser, changePassword } = useAuth()
  const [editing, setEditing] = useState<{ [key: string]: boolean }>({})
  const [editedUser, setEditedUser] = useState<User & { billingAddress?: Address } | null>(null)
  const [userChanged, setUserChanged] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set())
  const [oldPassword, setOldPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  if (!isAuthenticated) nav('/')

  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user])

  // Helper functions for nested field manipulation
  function setNestedField(obj: any, path: string, value: any) {
    const fields = path.split('.');
    let current = obj;
    for (let i = 0; i < fields.length - 1; i++) {
      if (!current[fields[i]]) current[fields[i]] = {};
      current = current[fields[i]];
    }
    current[fields[fields.length - 1]] = value;
  }

  function getNestedField(obj: any, path: string) {
    const fields = path.split('.');
    let current = obj;
    for (let i = 0; i < fields.length; i++) {
      if (!current) return undefined;
      current = current[fields[i]];
    }
    return current;
  }

  const handleEdit = (field: string) => {
    setEditing(prev => ({ ...prev, [field]: true }))
    setUserChanged(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value
    setEditedUser(prev => {
      if (!prev) return null
      const newUser = { ...prev }
      setNestedField(newUser, field, value)
      return newUser
    })
    setUserChanged(true)
    setChangedFields(prev => new Set(prev).add(field))
  }

  const handlePromotionsToggle = (checked: boolean) => {
    setEditedUser(prev => (prev ? { ...prev, isPromoted: checked } : null))
    setUserChanged(true)
    setChangedFields(prev => new Set(prev).add('isPromoted'))
  }

  const getUpdatedData = () => {
    const updatedData: any = {}
    const billingAddressFields = ['street', 'city', 'state', 'zipCode']

    // Check if any billingAddress fields are changed
    const billingAddressChanged = Array.from(changedFields).some(field =>
      field.startsWith('billingAddress.')
    )
    if (billingAddressChanged) {
      const address: any = {}
      billingAddressFields.forEach(field => {
        const value = getNestedField(editedUser, `billingAddress.${field}`)
        address[field] = value
      })
      updatedData.billingAddress = address
    }

    // Process other changed fields
    Array.from(changedFields).forEach(field => {
      if (field.startsWith('billingAddress.')) {
        // Already handled
        return
      }
      const value = getNestedField(editedUser, field)
      setNestedField(updatedData, field, value)
    })

    return updatedData
  }

  const handleSave = async () => {
    if (editedUser) {
      const updatedData = getUpdatedData()

      // Update other user data
      if (Object.keys(updatedData).length > 0) {
        await updateUser(updatedData)
      }

      console.log(user)
    }

    // Handle password change
    if (editing.password) {
      if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match.')
        return
      }

      try {
        await changePassword(oldPassword, newPassword)
        // Clear password fields
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        alert('Password changed successfully.')
      } catch (error) {
        console.error('Error changing password:', error)
        alert('An error occurred while changing the password.')
      }
    }

    setEditing({})
    setUserChanged(false)
    setChangedFields(new Set())
  }

  if (!editedUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Account Settings</h1>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-md bg-darkgray-800 p-1 text-darkgray-300 w-full">
            <TabsTrigger
              value="personal"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-darkgray-700 data-[state=active]:text-white data-[state=active]:shadow-sm flex-1"
            >
              Personal Information
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-darkgray-700 data-[state=active]:text-white data-[state=active]:shadow-sm flex-1"
            >
              Payment Methods
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card className="bg-darkgray-800 border-darkgray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  <UserIcon className="mr-2" /> Personal Information
                </CardTitle>
                <CardDescription className="text-darkgray-300">
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-darkgray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={editedUser.email}
                      disabled={true}
                      className="bg-darkgray-700 text-white border-darkgray-600"
                    />
                    <p className="text-xs text-darkgray-400">
                      Email cannot be changed for security reasons.
                    </p>
                  </div>
                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-darkgray-300">
                      Phone Number
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="phone_number"
                        value={editedUser.phone_number || ''}
                        onChange={e => handleChange(e, 'phone_number')}
                        disabled={!editing.phone_number}
                        className="bg-darkgray-700 text-white border-darkgray-600"
                      />
                      {!editing.phone_number && (
                        <Button
                          onClick={() => handleEdit('phone_number')}
                          size="icon"
                          variant="ghost"
                          className="text-darkgray-300 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* First Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-darkgray-300">
                      First Name
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="firstName"
                        value={editedUser.firstName}
                        onChange={e => handleChange(e, 'firstName')}
                        disabled={!editing.firstName}
                        className="bg-darkgray-700 text-white border-darkgray-600"
                      />
                      {!editing.firstName && (
                        <Button
                          onClick={() => handleEdit('firstName')}
                          size="icon"
                          variant="ghost"
                          className="text-darkgray-300 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Last Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-darkgray-300">
                      Last Name
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="lastName"
                        value={editedUser.lastName}
                        onChange={e => handleChange(e, 'lastName')}
                        disabled={!editing.lastName}
                        className="bg-darkgray-700 text-white border-darkgray-600"
                      />
                      {!editing.lastName && (
                        <Button
                          onClick={() => handleEdit('lastName')}
                          size="icon"
                          variant="ghost"
                          className="text-darkgray-300 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="space-y-2">
                  <div className='text-darkgray-300'>Change Password</div>
                  {!editing.password ? (
                    <Button
                      onClick={() => handleEdit('password')}
                      variant="outline"
                      className="border-darkgray-500 bg-darkgray-700 text-white hover:bg-darkgray-600 hover:text-white"
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Change Password
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Label htmlFor="oldPassword" className="text-darkgray-300">
                          Old Password
                        </Label>
                        <Input
                          id="oldPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={e => setOldPassword(e.target.value)}
                          className="bg-darkgray-700 text-white border-darkgray-600 pr-10"
                          placeholder="Enter old password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <Label htmlFor="newPassword" className="text-darkgray-300">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="bg-darkgray-700 text-white border-darkgray-600 pr-10"
                        placeholder="Enter new password"
                      />
                      <Label htmlFor="confirmPassword" className="text-darkgray-300">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="bg-darkgray-700 text-white border-darkgray-600 pr-10"
                        placeholder="Confirm new password"
                      />
                    </div>
                  )}
                </div>

                {/* Billing Address Section */}
                <div className="space-y-4">
                  <div className="relative">
                    <Label
                      htmlFor="billingAddress"
                      className="text-white text-lg font-medium"
                    >
                      Billing Address
                    </Label>
                  </div>
                  {['street', 'city', 'state', 'zipCode'].map((field, index) => (
                    <Input
                      key={field}
                      id={`billingAddress-${field}`}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={editedUser.billingAddress?.[field] || ''}
                      onChange={e => handleChange(e, `billingAddress.${field}`)}
                      disabled={!editing.billingAddress}
                      className={`bg-darkgray-700 text-white border-darkgray-600 ${
                        index === 0
                          ? 'rounded-t-md'
                          : index === 3
                          ? 'rounded-b-md'
                          : ''
                      }`}
                    />
                  ))}
                  {!editing.billingAddress && (
                    <Button
                      onClick={() => handleEdit('billingAddress')}
                      size="sm"
                      variant="ghost"
                      className="text-darkgray-300 hover:text-white mt-2"
                    >
                      <Edit2 className="h-4 w-4 mr-2" /> Edit Billing Address
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between bg-darkgray-700 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="promotions"
                      className={`text-lg ${
                        editedUser.isPromoted
                          ? 'text-green-300'
                          : 'text-darkgray-300'
                      }`}
                    >
                      Promotional Emails
                    </Label>
                    <p
                      className={`text-sm ${
                        editedUser.isPromoted
                          ? 'text-green-300'
                          : 'text-darkgray-400'
                      }`}
                    >
                      Receive emails about special offers and updates
                    </p>
                  </div>
                  <Switch
                    id="promotions"
                    checked={editedUser.isPromoted || false}
                    onCheckedChange={handlePromotionsToggle}
                  />
                </div>
                {/* (Promotions toggle code remains the same) */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <ManageCards/>
        </Tabs>
      </div>

      {userChanged && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={handleSave}
            className="bg-[#BA0C2F] hover:bg-[#98001D] text-white px-6 py-3 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
          >
            <Save className="mr-2 h-5 w-5" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}
