import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUiSettingsValues } from '@/redux/modules/uiSettings/actions';
import ButtonsSelect from '@/components/common/ButtonsSelect/ButtonsSelect';

const options = [
  { label: 'Drive', value: 'DRIVE' },
  { label: 'Paint', value: 'FREE' },
];

const SelectMode = () => {
  const mode = useSelector(state => state.uiSettings.mode);
  const dispatch = useDispatch();

  const handleSelectMode = useCallback(
    mode => {
      dispatch(
        setUiSettingsValues({
          mode,
        }),
      );
    },
    [dispatch],
  );

  return (
    <div>
      <ButtonsSelect options={options} onSelect={handleSelectMode} value={mode} />
    </div>
  );
};

SelectMode.protoTypes = {};

export default SelectMode;
