import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Info,
  Warning,
  Security,
  Receipt,
  Link,
  Memory,
  SportsEsports,
  VpnKey,
  Refresh,
  Assessment,
  PlayArrow,
} from '@mui/icons-material';
import { toast, Toaster } from 'react-hot-toast';
import juggernautClient from '../juggernautClient';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const JuggernautDemo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [receiptData, setReceiptData] = useState<string>('');
  const [chainData, setChainData] = useState<string>('');
  const [gamingData, setGamingData] = useState<string>('');
  const [computationId, setComputationId] = useState<string>('');
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [_isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkHealth();
    checkAuth();
  }, []);

  const checkAuth = () => {
    setIsAuthenticated(juggernautClient.isAuthenticated());
  };

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await juggernautClient.healthCheck();
      setHealthStatus(response);
      toast.success('System is healthy');
    } catch (error) {
      toast.error('Health check failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPublicKey = async () => {
    try {
      setLoading(true);
      const response = await juggernautClient.getPublicKey();
      setPublicKey((response.data as any)?.publicKey || '');
      toast.success('Public key retrieved');
    } catch (error) {
      toast.error('Failed to get public key');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyReceipt = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(receiptData || '{}');
      const response = await juggernautClient.verifyReceipt(data);
      setVerificationResults((response.data as any)?.verification || response.data);
      toast.success('Receipt verified successfully');
    } catch (error) {
      toast.error('Receipt verification failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(chainData || '{}');
      const response = await juggernautClient.verifyChain(data);
      setVerificationResults((response.data as any)?.verification || response.data);
      toast.success('Chain verified successfully');
    } catch (error) {
      toast.error('Chain verification failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const detectGaming = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(gamingData || '{}');
      const response = await juggernautClient.detectGaming(data);
      const detection = (response.data as any)?.detection || response.data;
      setVerificationResults(detection);

      if (detection?.gamingDetected) {
        toast.error('Gaming pattern detected!');
      } else {
        toast.success('No gaming patterns detected');
      }
    } catch (error) {
      toast.error('Gaming detection failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const triggerRecomputation = async () => {
    try {
      setLoading(true);
      const response = await juggernautClient.triggerRecomputation('dataset-001', {
        iterations: 100,
        threshold: 0.95,
      });
      const computation = (response.data as any)?.computation || response.data;
      setComputationId(computation?.id || '');
      toast.success('Recomputation initiated');
    } catch (error) {
      toast.error('Failed to trigger recomputation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkComputationStatus = async () => {
    if (!computationId) {
      toast.error('No computation ID available');
      return;
    }

    try {
      setLoading(true);
      const response = await juggernautClient.getComputationStatus(computationId);
      setVerificationResults(response.data);
      toast.success(`Computation status: ${(response.data as any)?.status || 'unknown'}`);
    } catch (error) {
      toast.error('Failed to get computation status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setVerificationResults(null);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Toaster position="top-right" />

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          Juggernaut IDV System Demo
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Independent Data Verification Platform - Complete Demo Application
        </Typography>

        {healthStatus && (
          <Alert severity="success" sx={{ mt: 2 }}>
            System Status: {healthStatus.status} | Environment: Production Ready
          </Alert>
        )}
      </Paper>

      <Paper elevation={2} sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Info />} label="Health & Keys" />
          <Tab icon={<Receipt />} label="Receipt Verification" />
          <Tab icon={<Link />} label="Chain Verification" />
          <Tab icon={<Memory />} label="Autonomy Recomputation" />
          <Tab icon={<SportsEsports />} label="Gaming Detection" />
          <Tab icon={<Assessment />} label="Analytics Dashboard" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: "flex", flexWrap: "wrap" }} spacing={3}>
            <Box sx={{ flex: { xs: "1 0 100%", md: "1 0 45%" }, p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Health Check
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={checkHealth}
                    disabled={loading}
                    fullWidth
                  >
                    Run Health Check
                  </Button>
                  {healthStatus && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`Status: ${healthStatus.status}`}
                        color="success"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2">
                        Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: "1 0 100%", md: "1 0 45%" }, p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Public Key Retrieval
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<VpnKey />}
                    onClick={getPublicKey}
                    disabled={loading}
                    fullWidth
                  >
                    Get Public Key
                  </Button>
                  {publicKey && (
                    <TextField
                      multiline
                      rows={4}
                      value={publicKey}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                      label="Public Key"
                    />
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Receipt Verification
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter receipt data in JSON format to verify its authenticity
              </Typography>
              <TextField
                multiline
                rows={6}
                value={receiptData}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiptData(e.target.value)}
                fullWidth
                margin="normal"
                label="Receipt Data (JSON)"
                placeholder='{"transactionId": "TX123", "amount": 100, "merchant": "Store ABC"}'
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircle />}
                onClick={verifyReceipt}
                disabled={loading || !receiptData}
                sx={{ mt: 2 }}
              >
                Verify Receipt
              </Button>

              {verificationResults && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity={verificationResults.status === 'verified' ? 'success' : 'warning'}>
                    Status: {verificationResults.status}
                  </Alert>
                  {verificationResults.confidence && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Confidence Score: {(verificationResults.confidence * 100).toFixed(2)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={verificationResults.confidence * 100}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Blockchain Chain Verification
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter chain data to verify blockchain integrity
              </Typography>
              <TextField
                multiline
                rows={6}
                value={chainData}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChainData(e.target.value)}
                fullWidth
                margin="normal"
                label="Chain Data (JSON)"
                placeholder='{"blocks": [...], "chainId": "chain-001"}'
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<Link />}
                onClick={verifyChain}
                disabled={loading || !chainData}
                sx={{ mt: 2 }}
              >
                Verify Chain
              </Button>

              {verificationResults && verificationResults.valid !== undefined && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity={verificationResults.valid ? 'success' : 'error'}>
                    Chain is {verificationResults.valid ? 'valid' : 'invalid'}
                  </Alert>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {verificationResults.details?.hashesValid ? <CheckCircle color="success" /> : <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText primary="Hash Validation" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {verificationResults.details?.linksValid ? <CheckCircle color="success" /> : <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText primary="Link Validation" />
                    </ListItem>
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: "flex", flexWrap: "wrap" }} spacing={3}>
            <Box sx={{ flex: { xs: "1 0 100%", md: "1 0 45%" }, p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trigger Recomputation
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrow />}
                    onClick={triggerRecomputation}
                    disabled={loading}
                    fullWidth
                  >
                    Start Recomputation
                  </Button>
                  {computationId && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Computation ID: {computationId}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: "1 0 100%", md: "1 0 45%" }, p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Check Status
                  </Typography>
                  <TextField
                    value={computationId}
                    onChange={(e) => setComputationId(e.target.value)}
                    fullWidth
                    margin="normal"
                    label="Computation ID"
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={checkComputationStatus}
                    disabled={loading || !computationId}
                    fullWidth
                  >
                    Check Status
                  </Button>

                  {verificationResults && verificationResults.status && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`Status: ${verificationResults.status}`}
                        color={verificationResults.status === 'completed' ? 'success' : 'default'}
                      />
                      {verificationResults.progress !== undefined && (
                        <LinearProgress
                          variant="determinate"
                          value={verificationResults.progress}
                          sx={{ mt: 2 }}
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gaming Pattern Detection
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Analyze data for potential gaming patterns and anomalies
              </Typography>
              <TextField
                multiline
                rows={6}
                value={gamingData}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGamingData(e.target.value)}
                fullWidth
                margin="normal"
                label="Data to Analyze (JSON)"
                placeholder='{"transactions": [...], "entityId": "user-001"}'
              />
              <Button
                variant="contained"
                color="warning"
                startIcon={<SportsEsports />}
                onClick={detectGaming}
                disabled={loading || !gamingData}
                sx={{ mt: 2 }}
              >
                Detect Gaming Patterns
              </Button>

              {verificationResults && verificationResults.gamingDetected !== undefined && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity={verificationResults.gamingDetected ? 'error' : 'success'}>
                    {verificationResults.gamingDetected ? 'Gaming patterns detected!' : 'No gaming patterns found'}
                  </Alert>
                  {verificationResults.riskScore !== undefined && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Risk Score: {(verificationResults.riskScore * 100).toFixed(2)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={verificationResults.riskScore * 100}
                        color={verificationResults.riskScore > 0.7 ? 'error' : 'warning'}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  )}
                  {verificationResults.recommendations && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Recommendations:</Typography>
                      <List dense>
                        {verificationResults.recommendations.map((rec: string, idx: number) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              <Warning fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: "flex", flexWrap: "wrap" }} spacing={3}>
            <Box sx={{ flex: { xs: "1 0 100%", md: "1 0 30%" }, p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Total Verifications
                  </Typography>
                  <Typography variant="h3">1,247</Typography>
                  <Typography variant="body2" color="text.secondary">
                    +12% from last month
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: "1 0 100%", md: "1 0 30%" }, p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    Success Rate
                  </Typography>
                  <Typography variant="h3">94.7%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Above target threshold
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: "1 0 100%", md: "1 0 30%" }, p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    Gaming Detected
                  </Typography>
                  <Typography variant="h3">23</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requires investigation
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: "1 0 100%", p: 1.5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Performance Metrics
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap" }} spacing={2}>
                    <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 45%", md: "1 0 22%" }, p: 1 }}>
                      <Typography variant="body2">Average Response Time</Typography>
                      <Typography variant="h6">142ms</Typography>
                    </Box>
                    <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 45%", md: "1 0 22%" }, p: 1 }}>
                      <Typography variant="body2">Uptime</Typography>
                      <Typography variant="h6">99.98%</Typography>
                    </Box>
                    <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 45%", md: "1 0 22%" }, p: 1 }}>
                      <Typography variant="body2">Active Computations</Typography>
                      <Typography variant="h6">7</Typography>
                    </Box>
                    <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 45%", md: "1 0 22%" }, p: 1 }}>
                      <Typography variant="body2">Queue Size</Typography>
                      <Typography variant="h6">3</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default JuggernautDemo;