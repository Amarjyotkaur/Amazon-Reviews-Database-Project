import React from 'react';
import { MDBInput } from 'mdbreact';

const InputPage = () => {
  return (
    <div>
      {/* Default checked */}
      <div class="custom-control custom-checkbox">
        <input type="checkbox" class="custom-control-input" id="defaultChecked2" checked>
        <label class="custom-control-label" for="defaultChecked2">Default checked</label>
        </input>
      </div>
    </div>
  )
}

export default InputPage;