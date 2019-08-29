import React from "react";
import PropTypes from "prop-types";
import { DataList } from "@patternfly/react-core";

const ImagesDataList = props => (
  <DataList
    aria-label={props.ariaLabel}
    data-level={props.listLevel}
    className={`cc-c-tree-view ${props.fullWidth ? "cc-m-full-width" : ""}`}
  >
    {props.children}
  </DataList>
);

ImagesDataList.propTypes = {
  ariaLabel: PropTypes.string,
  children: PropTypes.node,
  listLevel: PropTypes.number,
  fullWidth: PropTypes.bool
};

ImagesDataList.defaultProps = {
  ariaLabel: "",
  children: React.createElement("div"),
  listLevel: 1,
  fullWidth: false
};

export default ImagesDataList;
