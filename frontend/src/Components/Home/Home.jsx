// Header.jsx
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';

export default function ButtonAppBar() {
    const [userPoints, setUserPoints] = useState(0);
    const [usdtAmount, setUsdtAmount] = useState(0);

    const convertPointsToUSDT = (points) => {
        return points / 10000;
    };

    useEffect(() => {
        setUsdtAmount(convertPointsToUSDT(userPoints));
    }, [userPoints]);

    useEffect(() => {
        const fetchUserPoints = async () => {
            try {
                const points = localStorage.getItem('userPoints') || 0;
                setUserPoints(Number(points));
            } catch (error) {
                console.error('Error fetching user points:', error);
            }
        };

        fetchUserPoints();
    }, []);

    return (
        <Box sx={{ 
            width: '100%',
            height: '80px',
            border: '1px solid rgba(75,30,133,0.5)',
            background: 'linear-gradient(to bottom right, rgba(75,30,133,1), rgba(75,30,133,0.01))',
            backdropFilter: 'blur(12px)',
        }}>
            <AppBar position="static">
                <Toolbar sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to bottom right, rgba(75,30,133,1), rgba(75,30,133,0.01))',
                    backdropFilter: 'blur(12px)',
                    height: '80px',
                    border: '1px solid rgba(75,30,133,0.5)',
                    borderRadius: '0px 0px 20px 20px',
                }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {userPoints.toLocaleString()} Points
                    </Typography>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {usdtAmount.toFixed(4)} USDT
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    );
}