import axios from "axios";

const apiClient = axios.create({
  // TO-DO use environment variables
  // baseURL: "https://api-cluster-iq-vbelouso.apps.ocp-dev01.lab.eng.tlv2.redhat.com",
  baseURL: "http://localhost:8081/api/v1",
  // HARDCODED, CHANGE
  // baseURL: "http://localhost:9000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});



// Fetch mocked clusters
export async function getCluster(ClusterName) {
      try {
        const response = await apiClient.get(`/clusters/${ClusterName}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching mocked clusters:", error);
        throw error;
      }
}

// Fetch clusters
export const getClusters = async () => {
  try {
    const response = await apiClient.get("/clusters");
    return response.data;
  } catch (error) {
    console.error("Error fetching mocked clusters:", error);
    throw error;
  }
};

// Fetch accounts
export const getAccounts = async () => {
  try {
    const response = await apiClient.get("/accounts");
    return response.data;
  } catch (error) {
    console.error("Error fetching mocked accounts:", error);
    throw error;
  }
};

// Fetch Instances
export const getInstances = async () => {
  try {
    const response = await apiClient.get("/instances");
    return response.data;
  } catch (error) {
    console.error("Error fetching Instances:", error);
    throw error;
  }
};


// Fetch Account's clusters
export async function getAccountClusters(accountName) {
  try {
    const response = await apiClient.get(`/accounts/${accountName}/clusters`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Instances:", error);
    throw error;
  }
}


export async function getClusterInstances(accountName, clusterName) {
    try {
      const response = await apiClient.get(
        // HARDCODED, CHANGE
        `clusters/${clusterName}/instances`
        // TO-DO in case we move to path parameters replace the above line with the below line
        // `accounts/${accountName}/clusters/${clusterName}`
      );
      return response.data.instances;
    } catch (error) {
      console.error("Error fetching Instances:", error);
      throw error;
    }
}
