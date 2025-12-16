import { ResourceStatusApi } from '@api';
import { Dropdown, DropdownItem, DropdownList, MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ModalPowerManagement } from './ModalPowerManagement';
import { PowerAction } from './types';

interface ClusterDetailsDropdownProps {
  clusterStatus: ResourceStatusApi | null;
}

export const ClusterDetailsDropdown: React.FunctionComponent<ClusterDetailsDropdownProps> = ({ clusterStatus }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  useParams();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalAction, setModalAction] = React.useState<PowerAction | null>(null);

  // Disable actions based on cluster status
  const isPowerOnDisabled =
    clusterStatus === null || [ResourceStatusApi.Running, ResourceStatusApi.Terminated].includes(clusterStatus);

  const isPowerOffDisabled =
    clusterStatus === null || [ResourceStatusApi.Stopped, ResourceStatusApi.Terminated].includes(clusterStatus);

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (value === PowerAction.POWER_ON || value === PowerAction.POWER_OFF) {
      setModalAction(value as PowerAction);
      setIsModalOpen(true);
      setIsOpen(false);
    }
  };

  const resetModalState = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  return (
    <>
      <Dropdown
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={setIsOpen}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle ref={toggleRef} onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen}>
            Actions
          </MenuToggle>
        )}
      >
        <DropdownList>
          <DropdownItem value={PowerAction.POWER_ON} key="power on" isDisabled={isPowerOnDisabled}>
            {PowerAction.POWER_ON}
          </DropdownItem>
          <DropdownItem value={PowerAction.POWER_OFF} key="power off" isDisabled={isPowerOffDisabled}>
            {PowerAction.POWER_OFF}
          </DropdownItem>
        </DropdownList>
      </Dropdown>

      <ModalPowerManagement isOpen={isModalOpen} onClose={resetModalState} action={modalAction} />
    </>
  );
};
