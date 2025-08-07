import { useState, useEffect } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import StatCard from './StatCard'
import LineChart from './LineChart'
import './Numbers.css'
import { DATA_FILES } from '../config'

function Numbers() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('Loading monthly activity data from:', DATA_FILES.monthlyActivityAllTime)
        const response = await fetch(DATA_FILES.monthlyActivityAllTime)
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`)
        }
        const data = await response.json()
        
        // Parse dates and calculate statistics
        const now = new Date()
        const oneYearAgo = new Date(now)
        oneYearAgo.setFullYear(now.getFullYear() - 1)
        
        let totalNewBuildings = 0
        let totalEditedBuildings = 0
        let totalNewRoads = 0
        let totalEditedRoads = 0
        let totalNewAmenities = 0
        let totalEditedAmenities = 0
        
        let yearNewBuildings = 0
        let yearEditedBuildings = 0
        let yearNewRoads = 0
        let yearEditedRoads = 0
        let yearNewAmenities = 0
        let yearEditedAmenities = 0
        
        // Store data for charts
        const chartData = []
        
        data.forEach(row => {
          // Parse the date from Unix timestamp (in seconds)
          const date = new Date(row.month * 1000)
          
          if (!date || isNaN(date.getTime())) return
          
          // Parse the values using the actual field names from your JSON
          const newBuildings = +row.new_buildings || 0
          const editedBuildings = +row.edited_buildings || 0
          const newRoads = +row.new_highways || 0
          const editedRoads = +row.edited_highways || 0
          const newAmenities = +row.new_amenities || 0
          const editedAmenities = +row.edited_amenities || 0
          const chapters = +row.chapters || 0
          const users = +row.users || 0
          
          // Store for charts
          chartData.push({
            date,
            chapters,
            users,
            totalBuildings: newBuildings + editedBuildings,
            totalHighways: newRoads + editedRoads,
            totalAmenities: newAmenities + editedAmenities,
            totalActivity: newBuildings + editedBuildings + newRoads + editedRoads + newAmenities + editedAmenities
          })
          
          // Add to totals
          totalNewBuildings += newBuildings
          totalEditedBuildings += editedBuildings
          totalNewRoads += newRoads
          totalEditedRoads += editedRoads
          totalNewAmenities += newAmenities
          totalEditedAmenities += editedAmenities
          
          // Add to last year totals if within the last year
          if (date >= oneYearAgo) {
            yearNewBuildings += newBuildings
            yearEditedBuildings += editedBuildings
            yearNewRoads += newRoads
            yearEditedRoads += editedRoads
            yearNewAmenities += newAmenities
            yearEditedAmenities += editedAmenities
          }
        })
        
        // Sort chart data by date
        chartData.sort((a, b) => a.date - b.date)
        
        setStats({
          total: {
            newBuildings: totalNewBuildings,
            editedBuildings: totalEditedBuildings,
            newRoads: totalNewRoads,
            editedRoads: totalEditedRoads,
            newAmenities: totalNewAmenities,
            editedAmenities: totalEditedAmenities
          },
          lastYear: {
            newBuildings: yearNewBuildings,
            editedBuildings: yearEditedBuildings,
            newRoads: yearNewRoads,
            editedRoads: yearEditedRoads,
            newAmenities: yearNewAmenities,
            editedAmenities: yearEditedAmenities
          },
          chartData
        })
        
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load activity data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <Container className="mt-5 pt-3">
        <Row>
          <Col>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading statistics...</p>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-5 pt-3">
        <Row>
          <Col>
            <div className="alert alert-danger">
              <h4>Error</h4>
              <p>{error}</p>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container className="mt-5 pt-3">
      <Row className="mb-4">
        <Col>
          <h1 className="display-4">YouthMappers by the Numbers</h1>
          <p className="lead">More than a decade of contributions to OpenStreetMap</p>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col md={6} lg={4}>
          <StatCard
            title="New Buildings"
            totalValue={stats?.total.newBuildings || 0}
            yearValue={stats?.lastYear.newBuildings || 0}
            icon="🏢"
            color="building-color"
          />
        </Col>
        
        <Col md={6} lg={4}>
          <StatCard
            title="New Highways"
            totalValue={stats?.total.newRoads || 0}
            yearValue={stats?.lastYear.newRoads || 0}
            icon="🛣️"
            color="road-color"
          />
        </Col>
        
        <Col md={6} lg={4}>
          <StatCard
            title="New Amenities"
            totalValue={stats?.total.newAmenities || 0}
            yearValue={stats?.lastYear.newAmenities || 0}
            icon="🏪"
            color="amenity-color"
          />
        </Col>
      </Row>
      
      <Row className="g-4 mt-3">
        <Col md={6} lg={4}>
          <StatCard
            title="Edited Buildings"
            totalValue={stats?.total.editedBuildings || 0}
            yearValue={stats?.lastYear.editedBuildings || 0}
            icon="🔧"
            color="edit-color"
            compact={true}
          />
        </Col>
        
        <Col md={6} lg={4}>
          <StatCard
            title="Edited Highways"
            totalValue={stats?.total.editedRoads || 0}
            yearValue={stats?.lastYear.editedRoads || 0}
            icon="⚡"
            color="edit-color"
            compact={true}
          />
        </Col>
        
        <Col md={6} lg={4}>
          <StatCard
            title="Edited Amenities"
            totalValue={stats?.total.editedAmenities || 0}
            yearValue={stats?.lastYear.editedAmenities || 0}
            icon="🔨"
            color="edit-color"
            compact={true}
          />
        </Col>
      </Row>
      
      <Row className="g-4 mt-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Active Chapters Over Time"
                  dataKey="chapters"
                  color="#667eea"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Active Mappers Over Time"
                  dataKey="users"
                  color="#4facfe"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4 mt-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Buildings Added Over Time"
                  dataKey="totalBuildings"
                  color="#667eea"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Highways Added Over Time"
                  dataKey="totalHighways"
                  color="#4facfe"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4 mt-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Amenities Added Over Time"
                  dataKey="totalAmenities"
                  color="#88d8a3"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              {stats?.chartData && (
                <LineChart 
                  data={stats.chartData}
                  title="Total Monthly Activity"
                  dataKey="totalActivity"
                  color="#f5576c"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>About These Statistics</Card.Title>
              <Card.Text>
                These numbers represent the collective contributions of YouthMappers chapters worldwide to OpenStreetMap. 
                Data includes building mapping, road creation and editing, and other geographic features added by our community.
                Statistics are updated based on daily activity tracking across all participating chapters.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Numbers