import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownToggle, KebabToggle } from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";

class ActionsDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.onToggle = this.onToggle.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  onToggle() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  onSelect(event) {
    console.log(event);
  }

  render() {
    const toggle = this.props.kebabToggle ? (
      <KebabToggle onToggle={this.onToggle} aria-label={this.props.label} />
    ) : (
      <DropdownToggle onToggle={this.onToggle} iconComponent={CaretDownIcon}>
        {this.props.label}
      </DropdownToggle>
    );
    return (
      <Dropdown
        id={this.props.id}
        className={this.props.className}
        onSelect={this.onSelect}
        toggle={toggle}
        isOpen={this.state.isOpen}
        isPlain
        dropdownItems={this.props.dropdownItems}
      />
    );
  }
}

ActionsDropdown.propTypes = {
  id: PropTypes.string,
  dropdownItems: PropTypes.arrayOf(PropTypes.element),
  kebabToggle: PropTypes.bool,
  label: PropTypes.string.isRequired,
  className: PropTypes.string
};

ActionsDropdown.defaultProps = {
  id: "",
  dropdownItems: [],
  kebabToggle: true,
  className: ""
};

export default ActionsDropdown;
