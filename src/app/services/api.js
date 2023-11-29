import axios from "axios";

const apiURL = process.env.REACT_APP_CIQ_API_URL

const apiClient = axios.create({
  baseURL: apiURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});



// Fetch cluster by name
export async function getCluster(clusterID) {
    try {
      const response = await apiClient.get(`/clusters/${clusterID}`);
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

// Fetch account by name
export async function getAccountByName(AccountName) {
  try {
    const response = await apiClient.get(`/accounts/${AccountName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mocked accounts:", error);
    throw error;
  }
}

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
export async function getInstanceByID(instanceID) {
  try {
    const response = await apiClient.get(`/instances/${instanceID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Instance By ID:", error);
   throw error;
  }
}

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
    return response.data.clusters;
  } catch (error) {
    console.error("Error fetching Instances:", error);
    throw error;
  }
}


export async function getClusterInstances(accountName, clusterID) {
    try {
      const response = await apiClient.get(`clusters/${clusterID}/instances`);
      return response.data.instances;
    } catch (error) {
      console.error("Error fetching Instances:", error);
      throw error;
    }
}


export async function getClusterTags(clusterID) {
    try {
      const response = await apiClient.get(`clusters/${clusterID}/tags`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Tags:", error);
      throw error;
    }
}
