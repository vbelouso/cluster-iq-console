import {
  Label,
} from "@patternfly/react-core";
import React from "react";

export function renderStatusLabel (labelText: string | null | undefined) {
    switch (labelText) {
      case "Running":
        return <Label color="green">{labelText}</Label>;
      case "Stopped":
        return <Label color="red">{labelText}</Label>;
      case "Terminated":
        return <Label color="purple">{labelText}</Label>;
      case "Unknown":
        return <Label color="gold">{labelText}</Label>;
      default:
        return <Label color="grey">{labelText}</Label>;
    }
  }
