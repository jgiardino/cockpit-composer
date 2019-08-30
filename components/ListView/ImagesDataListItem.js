import React from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Button,
  DropdownItem,
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListToggle,
  DataListContent,
  DataListItemCells
} from "@patternfly/react-core";
import { BuilderImageIcon, ServiceIcon } from "@patternfly/react-icons";
import { deletingCompose, cancellingCompose } from "../../core/actions/composes";
import {
  setModalStopBuildVisible,
  setModalStopBuildState,
  setModalDeleteImageVisible,
  setModalDeleteImageState
} from "../../core/actions/modals";
import ImagesDataList from "./ImagesDataList";
import ActionsDropdown from "../Dropdown/ActionsDropdown";
import * as composer from "../../core/composer";

class ImagesDataListItem extends React.Component {
  constructor() {
    super();
    this.state = { logsExpanded: false, uploadsExpanded: false };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleShowModalStop = this.handleShowModalStop.bind(this);
    this.handleShowModalDeleteImage = this.handleShowModalDeleteImage.bind(this);
    this.handleLogsShow = this.handleLogsShow.bind(this);
    this.handleUploadsShow = this.handleUploadsShow.bind(this);
  }

  // maps to Remove button for FAILED
  handleDelete() {
    this.props.deletingCompose(this.props.listItem.id);
  }

  // maps to Stop button for WAITING
  handleCancel() {
    this.props.cancellingCompose(this.props.listItem.id);
  }

  // maps to Stop button for RUNNING
  handleShowModalStop() {
    this.props.setModalStopBuildState(this.props.listItem.id, this.props.blueprint);
    this.props.setModalStopBuildVisible(true);
  }

  // maps to Delete button for FINISHED
  handleShowModalDeleteImage(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.setModalDeleteImageState(this.props.listItem.id, this.props.blueprint);
    this.props.setModalDeleteImageVisible(true);
  }

  handleLogsShow() {
    this.setState({ uploadsExpanded: false });
    this.setState(prevState => ({ logsExpanded: !prevState.logsExpanded, fetchingLogs: !prevState.logsExpanded }));
    composer.getComposeLog(this.props.listItem.id).then(
      logs => {
        this.setState({ logsContent: logs, fetchingLogs: false });
      },
      () => {
        this.setState({
          logsContent: <FormattedMessage defaultMessage="No log available" />,
          fetchingLogs: false
        });
      }
    );
  }
  handleUploadsShow() {
    this.setState({ logsExpanded: false });
    this.setState(prevState => ({ uploadsExpanded: !prevState.uploadsExpanded }));
  }

  render() {
    const { listItem } = this.props;
    const timestamp = new Date(listItem.job_created * 1000);
    const formattedTime = timestamp.toDateString();
    let status;
    switch (listItem.queue_status) {
      case "WAITING":
        status = (
          <>
            <span className="pficon pficon-pending" aria-hidden="true" />
            {` `}
            <FormattedMessage defaultMessage="Image build pending" />
          </>
        );
        break;
      case "RUNNING":
        status = (
          <>
            <span className="pficon pficon-in-progress" aria-hidden="true" />
            {` `}
            <FormattedMessage defaultMessage="Image build in progress" />
          </>
        );
        break;
      case "FINISHED":
        status = (
          <>
            <span className="pficon pficon-ok" aria-hidden="true" />
            {` `}
            <FormattedMessage defaultMessage="Image build complete" />
          </>
        );
        break;
      case "FAILED":
        status = (
          <>
            <span className="pficon pficon-error-circle-o" aria-hidden="true" />
            {` `}
            <FormattedMessage defaultMessage="Image build failed" />
          </>
        );
        break;
      default:
        status = <p>other status</p>;
    }
    const logsButton = (
      <Button variant={`${this.state.logsExpanded ? "primary" : "secondary"}`} onClick={this.handleLogsShow}>
        <FormattedMessage defaultMessage="Logs" />
      </Button>
    );
    let logsSection;
    if (this.state.logsExpanded) {
      if (this.state.fetchingLogs) {
        logsSection = (
          <div>
            <div className="spinner spinner-sm pull-left" aria-hidden="true" />
            <FormattedMessage defaultMessage="Loading log messages" />
          </div>
        );
      } else logsSection = <pre className="pf-u-m-0">{this.state.logsContent}</pre>;
    }
    const actions = [
      this.props.listItem.queue_status === "FINISHED" && (
        <DropdownItem key="download" component="a" href={this.props.downloadUrl} download tabIndex="0">
          <FormattedMessage defaultMessage="Download" />
        </DropdownItem>
      ),
      this.props.listItem.queue_status === "FINISHED" && (
        <button key="delete" className="pf-c-dropdown__menu-item" type="button">
          Action
        </button>
      )
    ];
    return (
      <DataListItem isExpanded={this.state.uploadsExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={this.handleUploadsShow}
            isExpanded={this.state.uploadsExpanded}
            id="ex-toggle1"
            aria-controls="ex-expand1"
          />
          <div className="cc-c-data-list__item-icon">
            <BuilderImageIcon />
          </div>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="blueprint">
                <strong id="ex-item3a">
                  {this.props.blueprint}-{listItem.version}-{listItem.compose_type}
                </strong>
              </DataListCell>,
              <DataListCell key="type">
                <span>Type</span> <strong>{listItem.compose_type}</strong>
              </DataListCell>,
              <DataListCell key="date">
                <span>Created</span> <strong>{formattedTime}</strong>
              </DataListCell>
            ]}
          />
          <div className="cc-c-data-list__item-status">{status}</div>
          <div className="pf-c-data-list__item-action">
            <ActionsDropdown dropdownItems={actions} />
          </div>
          <div
            aria-hidden={!this.props.listItem.queue_status === "WAITING"}
            className={`pf-c-data-list__item-action ${
              this.props.listItem.queue_status === "WAITING" ? "cc-u-not-visible" : ""
            }`}
          >
            {logsButton}
          </div>
        </DataListItemRow>
        <DataListContent aria-label="Uploads" id="ex-expand1" isHidden={!this.state.uploadsExpanded} noPadding>
          <ImagesDataList listLevel="2" fullWidth>
            <DataListItem>
              <DataListItemRow>
                <DataListToggle aria-hidden="true" />
                <div className="cc-c-data-list__item-icon">
                  <ServiceIcon />
                </div>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="blueprint">
                      <strong id="ex-item3a">Type of upload</strong>
                    </DataListCell>,
                    <DataListCell key="date">
                      <span>Started</span> <strong>{formattedTime}</strong>
                    </DataListCell>
                  ]}
                />
                <div className="cc-c-data-list__item-status">
                  <span className="pficon pficon-ok" aria-hidden="true" />
                  {` `}
                  <FormattedMessage defaultMessage="Upload action complete" />
                </div>
                <div className="pf-c-data-list__item-action">
                  <ActionsDropdown dropdownItems={actions} />
                </div>
                <div
                  aria-hidden={!this.props.listItem.queue_status === "WAITING"}
                  className={`pf-c-data-list__item-action ${
                    this.props.listItem.queue_status === "WAITING" ? "cc-u-not-visible" : ""
                  }`}
                >
                  {logsButton}
                </div>
              </DataListItemRow>
              <DataListContent aria-label="Logs" id="ex-expand1" isHidden={!this.state.logsExpanded} noPadding>
                {logsSection}
              </DataListContent>
            </DataListItem>
          </ImagesDataList>
        </DataListContent>
        <DataListContent aria-label="Logs" id="ex-expand1" isHidden={!this.state.logsExpanded} noPadding>
          {logsSection}
        </DataListContent>
      </DataListItem>
    );
  }
}

ImagesDataListItem.propTypes = {
  listItem: PropTypes.shape({
    blueprint: PropTypes.string,
    compose_type: PropTypes.string,
    id: PropTypes.string,
    image_size: PropTypes.number,
    job_created: PropTypes.number,
    job_finished: PropTypes.number,
    job_started: PropTypes.number,
    queue_status: PropTypes.string,
    version: PropTypes.string
  }),
  blueprint: PropTypes.string,
  deletingCompose: PropTypes.func,
  cancellingCompose: PropTypes.func,
  setModalStopBuildState: PropTypes.func,
  setModalStopBuildVisible: PropTypes.func,
  setModalDeleteImageState: PropTypes.func,
  setModalDeleteImageVisible: PropTypes.func,
  downloadUrl: PropTypes.string
};

ImagesDataListItem.defaultProps = {
  listItem: {},
  blueprint: "",
  deletingCompose: function() {},
  cancellingCompose: function() {},
  setModalStopBuildState: function() {},
  setModalStopBuildVisible: function() {},
  setModalDeleteImageState: function() {},
  setModalDeleteImageVisible: function() {},
  downloadUrl: ""
};

const mapDispatchToProps = dispatch => ({
  deletingCompose: compose => {
    dispatch(deletingCompose(compose));
  },
  cancellingCompose: compose => {
    dispatch(cancellingCompose(compose));
  },
  setModalStopBuildState: (composeId, blueprintName) => {
    dispatch(setModalStopBuildState(composeId, blueprintName));
  },
  setModalStopBuildVisible: visible => {
    dispatch(setModalStopBuildVisible(visible));
  },
  setModalDeleteImageState: (composeId, blueprintName) => {
    dispatch(setModalDeleteImageState(composeId, blueprintName));
  },
  setModalDeleteImageVisible: visible => {
    dispatch(setModalDeleteImageVisible(visible));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(ImagesDataListItem);
