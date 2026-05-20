import React, { useState } from 'react';
import { FlagGroup } from '@atlaskit/flag';
import Flag from '@atlaskit/flag';
import { useData } from './context';
import Dashboard from './components/Dashboard';
import ActivityLog from './components/ActivityLog';
import UserManagement from './components/UserManagement';
import AppTopNavigation from './components/AppTopNavigation';
import AppSideNavigation, { type AppView } from './components/AppSideNavigation';
import AppPageHeader from './components/AppPageHeader';
import InventoryListView from './components/InventoryListView';
import Settings from './components/Settings';
import AuditMode from './components/AuditMode';
import { Box, Text, xcss } from '@atlaskit/primitives';
import './app-shell.css';

export default function App() {
  // Get all data and handlers from context
  const {
    equipment,
    checkouts,
    users,
    managers,
    activityLog,
    categories,
    currentManager,
    flags,
    dismissFlag,
    handleCheckOut,
    handleCheckIn,
    handleSendReminder,
    handleAddUser,
    handleEditUser,
    handleAddManager,
    handleEditManager,
    handleRemoveManager,
    handleUpdateProfile,
    handleUpdateCategory,
    handleAddEquipment,
    handleArchive,
    handleEditItem,
    handleAddGeneralNote,
    addActivity,
  } = useData();

  // Local UI state only
  const [activeView, setActiveView] = useState<AppView>('board');
  const [inventoryQuery, setInventoryQuery] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'all' | 'active' | 'available' | 'checked_out' | 'archived'>('all');

  const overdueCount = checkouts.filter(c => c.isOverdue).length;

  const statusOptions = [
    { label: 'Active items', value: 'active' },
    { label: 'All items', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Checked out', value: 'checked_out' },
    { label: 'Archived', value: 'archived' },
  ] as const;

  const selectedStatusOption = statusOptions.find(option => option.value === inventoryStatusFilter) ?? null;

  const headerConfig = {
    board: {
      breadcrumbs: ['Inventory', 'Board'],
      title: `Queues (${overdueCount} overdue)`,
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Identity and access',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('iam' as AppView),
    },
    inventory: {
      breadcrumbs: ['Inventory', 'List view'],
      title: 'Inventory list',
      primaryActionLabel: 'Board view',
      secondaryActionLabel: 'Reports',
      onPrimaryAction: () => setActiveView('board' as AppView),
      onSecondaryAction: () => setActiveView('activity' as AppView),
    },
    iam: {
      breadcrumbs: ['Administration', 'Identity and access'],
      title: 'Identity and access management',
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Reports',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('activity' as AppView),
    },
    activity: {
      breadcrumbs: ['Inventory', 'Reports'],
      title: 'Reports and activity',
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Identity and access',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('iam' as AppView),
    },
    settings: {
      breadcrumbs: ['Administration', 'Project settings'],
      title: 'Project settings',
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Reports',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('activity' as AppView),
    },
    audit: {
      breadcrumbs: ['Administration', 'Equipment Audit'],
      title: 'Equipment Audit',
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Reports',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('activity' as AppView),
    },
  } as const;

  const currentHeader = headerConfig[activeView];

  return (
    <Box
      xcss={xcss({ height: '100vh' })}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#F7F8F9',
      }}
    >
      <AppTopNavigation onCreate={() => setActiveView('inventory')} />

      <div className="app-main">
        <AppSideNavigation activeView={activeView} onSelect={setActiveView} />

        <div className="app-content">
          <AppPageHeader
            breadcrumbs={currentHeader.breadcrumbs}
            title={currentHeader.title}
            primaryActionLabel={currentHeader.primaryActionLabel}
            secondaryActionLabel={currentHeader.secondaryActionLabel}
            onPrimaryAction={currentHeader.onPrimaryAction}
            onSecondaryAction={currentHeader.onSecondaryAction}
            filterPlaceholder={activeView === 'inventory' ? 'Search by equipment, tag, or category' : undefined}
            filterValue={activeView === 'inventory' ? inventoryQuery : undefined}
            onFilterChange={activeView === 'inventory' ? setInventoryQuery : undefined}
            selectPlaceholder={activeView === 'inventory' ? 'Choose a status' : undefined}
            selectOptions={activeView === 'inventory' ? [...statusOptions] : undefined}
            selectedOption={activeView === 'inventory' ? selectedStatusOption : undefined}
            onSelectChange={activeView === 'inventory'
              ? (option) => {
                if (option) {
                  setInventoryStatusFilter(option.value as 'all' | 'active' | 'available' | 'checked_out' | 'archived');
                }
              }
              : undefined}
          />

          <div className="app-view-slot">
            {activeView === 'board' && (
              <Dashboard
                equipment={equipment}
                checkouts={checkouts}
                categories={categories}
                users={users}
                activityLog={activityLog}
                role={currentManager.role}
                onCheckOut={handleCheckOut}
                onCheckIn={handleCheckIn}
                onSendReminder={handleSendReminder}
                onAddEquipment={handleAddEquipment}
                onAddActivity={addActivity}
                onAddGeneralNote={handleAddGeneralNote}
                onEditItem={handleEditItem}
                onUpdateCategory={handleUpdateCategory}
              />
            )}

            {activeView === 'inventory' && (
              <InventoryListView
                equipment={equipment}
                categories={categories}
                checkouts={checkouts}
                users={users}
                query={inventoryQuery}
                statusFilter={inventoryStatusFilter}
                onStatusFilterChange={setInventoryStatusFilter}
                role={currentManager.role}
                onCheckOut={handleCheckOut}
                onCheckIn={handleCheckIn}
                onSendReminder={handleSendReminder}
                onArchive={handleArchive}
                onEditItem={handleEditItem}
                onAddEquipment={handleAddEquipment}
              />
            )}

            {activeView === 'iam' && (
              <div className="app-pane">
                <UserManagement
                  users={users}
                  managers={managers}
                  role={currentManager.role}
                  onAddUser={handleAddUser}
                  onEditUser={handleEditUser}
                  onAddManager={handleAddManager}
                  onEditManager={handleEditManager}
                  onRemoveManager={handleRemoveManager}
                />
              </div>
            )}

            {activeView === 'activity' && (
              <div className="app-pane">
                <ActivityLog log={activityLog} equipment={equipment} users={users} />
              </div>
            )}

            {activeView === 'settings' && (
              <div className="app-pane">
                <Settings
                  currentManager={currentManager}
                  onUpdateProfile={handleUpdateProfile}
                />
              </div>
            )}

            {activeView === 'audit' && (
              <div className="app-pane">
                <AuditMode
                  equipment={equipment}
                  categories={categories}
                  users={users}
                  currentRole={currentManager.role}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <FlagGroup onDismissed={(id) => dismissFlag(String(id))}>
        {flags.map(f => (
          <Flag
            key={f.id} id={f.id} title={f.title} description={f.description}
            icon={
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: f.type === 'success' ? '#36B37E' : '#0052CC',
                  color: 'white',
                }}
              >
                <Text as="strong" size="small" weight="bold" color="inherit">
                  {f.type === 'success' ? '✓' : 'i'}
                </Text>
              </Box>
            }
          />
        ))}
      </FlagGroup>
    </Box>
  );
}
