declare module "*.svg" {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  import { Icon } from 'react-native-vector-icons/Icon';
  const content: React.FC<SvgProps>;
  export default content;
  class FontAwesome extends Icon {}
  export default FontAwesome;
}