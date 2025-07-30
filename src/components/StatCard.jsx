import { useState, useEffect } from 'react'
import { Card } from 'react-bootstrap'
import './StatCard.css'

function StatCard({ title, totalValue, yearValue, icon, color, compact = false }) {
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [animatedYear, setAnimatedYear] = useState(0)
  
  useEffect(() => {
    if (!totalValue || !yearValue) return
    
    // Simple timeout-based animation
    let totalStep = 0
    let yearStep = 0
    const totalSteps = 60
    const yearSteps = 60
    
    const totalIncrement = totalValue / totalSteps
    const yearIncrement = yearValue / yearSteps
    
    const totalTimer = setInterval(() => {
      totalStep++
      if (totalStep <= totalSteps) {
        setAnimatedTotal(Math.round(totalIncrement * totalStep))
      } else {
        setAnimatedTotal(totalValue)
        clearInterval(totalTimer)
      }
    }, 30)
    
    // Start year animation with slight delay
    const yearTimer = setTimeout(() => {
      const yearInterval = setInterval(() => {
        yearStep++
        if (yearStep <= yearSteps) {
          setAnimatedYear(Math.round(yearIncrement * yearStep))
        } else {
          setAnimatedYear(yearValue)
          clearInterval(yearInterval)
        }
      }, 25)
      
      return () => clearInterval(yearInterval)
    }, 300)
    
    return () => {
      clearInterval(totalTimer)
      clearTimeout(yearTimer)
    }
  }, [totalValue, yearValue])
  
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }
  
  return (
    <Card className={`stat-card h-100 ${compact ? 'compact' : ''}`}>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex align-items-center mb-3">
          <div className={`stat-icon ${color} ${compact ? 'small' : ''}`}>
            {icon}
          </div>
          <div className="ms-3">
            <Card.Title className={`mb-0 ${compact ? 'h6' : 'h5'}`}>{title}</Card.Title>
          </div>
        </div>
        
        <div className="stat-values">
          <div className="total-stat">
            <div className="stat-label">All Time</div>
            <div className={`stat-number ${compact ? 'compact' : ''}`}>{formatNumber(animatedTotal)}</div>
          </div>
          
          <div className="year-stat">
            <div className="stat-label">Last 12 Months</div>
            <div className={`stat-number text-primary ${compact ? 'compact' : ''}`}>{formatNumber(animatedYear)}</div>
          </div>
        </div>
        
        <div className="stat-percentage mt-auto">
          <small className="text-muted">
            {totalValue > 0 ? `${((yearValue / totalValue) * 100).toFixed(1)}% in last year` : 'No data'}
          </small>
        </div>
      </Card.Body>
    </Card>
  )
}

export default StatCard
