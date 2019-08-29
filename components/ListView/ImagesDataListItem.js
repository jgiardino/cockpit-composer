import React from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Button,
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListToggle,
  DataListContent,
  DataListItemCells
} from "@patternfly/react-core";
import { deletingCompose, cancellingCompose } from "../../core/actions/composes";
import {
  setModalStopBuildVisible,
  setModalStopBuildState,
  setModalDeleteImageVisible,
  setModalDeleteImageState
} from "../../core/actions/modals";
import * as composer from "../../core/composer";

class ListItemImages extends React.Component {
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
    this.setState(prevState => ({ uploadsExpanded: !prevState.uploadsExpanded }));
  }

  render() {
    const { listItem } = this.props;
    const timestamp = new Date(listItem.job_created * 1000);
    const formattedTime = timestamp.toDateString();
    let status;
    switch (listItem.queue_status) {
      case "WAITING":
        status = <FormattedMessage defaultMessage="Pending" />;
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
      } else logsSection = <pre>{this.state.logsContent}</pre>;
    }

    return (
      <DataListItem>
        <DataListItemRow>
          <DataListToggle
            onClick={this.handleUploadsShow}
            isExpanded={this.state.uploadsExpanded}
            id="ex-toggle1"
            aria-controls="ex-expand1"
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell key="primary content">
                <strong id="ex-item3a">
                  {this.props.blueprint}-{listItem.version}-{listItem.compose_type}
                </strong>
              </DataListCell>,
              <DataListCell key="secondary content">
                <span>Type</span> <strong>{listItem.compose_type}</strong>
              </DataListCell>,
              <DataListCell key="secondary content">
                <span>Created</span> <strong>{formattedTime}</strong>
              </DataListCell>
            ]}
          />
          <div className="cc-c-data-list__item-status">{status}</div>
          <div className="pf-c-data-list__item-action">
            {listItem.queue_status === "FINISHED" && (
              <Button component="a" href={this.props.downloadUrl} download role="button">
                <FormattedMessage defaultMessage="Download" />
              </Button>
            )}
          </div>
          <div className="pf-c-data-list__item-action">{logsButton}</div>
        </DataListItemRow>
        <DataListContent aria-label="Uploads" id="ex-expand1" isHidden={!this.state.uploadsExpanded} noPadding>
          <p>Uploads would be listed here</p>
        </DataListContent>
        <DataListContent aria-label="Logs" id="ex-expand1" isHidden={!this.state.logsExpanded} noPadding>
          {logsSection}
        </DataListContent>
      </DataListItem>
    );
  }
}

ListItemImages.propTypes = {
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

ListItemImages.defaultProps = {
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
)(ListItemImages);
