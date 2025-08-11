import React, { useMemo } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

function ChapterStats({ weeklyData, chapter, chapters }) {
  // Determine if we're showing single or multiple chapters
  const isMultipleChapters = chapters && chapters.length > 1
  const displayTitle = isMultipleChapters 
    ? `Combined Statistics (${chapters.length} chapters)` 
    : chapter?.chapter || 'Chapter Statistics'
  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) return null

    // For multiple chapters, we need to count unique weeks with any activity
    // For single chapter, we can use the simpler approach
    let totalActiveWeeks
    
    if (isMultipleChapters) {
      // Group by week and check if any chapter had activity that week
      const weeklyTotals = weeklyData.reduce((acc, week) => {
        const weekKey = week.week.toISOString().split('T')[0] // Use date as key
        if (!acc[weekKey]) {
          acc[weekKey] = 0
        }
        acc[weekKey] += week.all_feats
        return acc
      }, {})
      
      // Count weeks where total activity > 0
      totalActiveWeeks = Object.values(weeklyTotals).filter(total => total > 0).length
    } else {
      // For single chapter, count weeks where this chapter had activity
      totalActiveWeeks = weeklyData.filter(week => week.all_feats > 0).length
    }

    const totals = weeklyData.reduce((acc, week) => ({
      all_feats: acc.all_feats + week.all_feats,
      buildings: acc.buildings + week.buildings,
      highways: acc.highways + week.highways,
      amenities: acc.amenities + week.amenities,
      other: acc.other + week.other,
      maxMappers: Math.max(acc.maxMappers, week.mappers)
    }), {
      all_feats: 0,
      buildings: 0,
      highways: 0,
      amenities: 0,
      other: 0,
      maxMappers: 0
    })

    const avgWeeklyActivity = totalActiveWeeks > 0 ? Math.round(totals.all_feats / totalActiveWeeks) : 0

    return {
      ...totals,
      totalWeeks: totalActiveWeeks,
      avgWeeklyActivity
    }
  }, [weeklyData, isMultipleChapters])

  // Prepare data for charts
  const chartData = useMemo(() => {
    return weeklyData.map(week => ({
      ...week,
      weekLabel: week.week.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }))
  }, [weeklyData])

  // Prepare feature type distribution data
  const featureDistribution = useMemo(() => {
    if (!summaryStats) return []
    
    return [
      { name: 'Buildings', value: summaryStats.buildings, color: '#8884d8' },
      { name: 'Highways', value: summaryStats.highways, color: '#82ca9d' },
      { name: 'Amenities', value: summaryStats.amenities, color: '#ffc658' },
      { name: 'Other', value: summaryStats.other, color: '#ff7300' }
    ].filter(item => item.value > 0)
  }, [summaryStats])

  if (!summaryStats) {
    return null
  }

  return (
    <>
      {/* Section Title */}
      <Row className="mb-4">
        <Col>
          <h2>{displayTitle}</h2>
          {isMultipleChapters && (
            <p className="text-muted">
              Combined statistics for {chapters.map(c => c.chapter).join(', ')}
            </p>
          )}
        </Col>
      </Row>

      {/* Summary Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="h2 text-primary">{summaryStats.all_feats.toLocaleString()}</Card.Title>
              <Card.Text>Total Features Edited</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="h2 text-success">{summaryStats.totalWeeks}</Card.Title>
              <Card.Text>Active Weeks</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="h2 text-info">{summaryStats.avgWeeklyActivity.toLocaleString()}</Card.Title>
              <Card.Text>Avg Weekly Activity</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="h2 text-warning">{summaryStats.maxMappers}</Card.Title>
              <Card.Text>Peak Weekly Mappers</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Activity Over Time Chart */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Weekly Activity Over Time</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="weekLabel" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => `Week of ${label}`}
                    formatter={(value, name) => [value.toLocaleString(), name]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="all_feats" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Total Features"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Feature Types Charts */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Feature Types Over Time</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="weekLabel" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => `Week of ${label}`}
                    formatter={(value, name) => [value.toLocaleString(), name]}
                  />
                  <Legend />
                  <Bar dataKey="buildings" stackId="a" fill="#8884d8" name="Buildings" />
                  <Bar dataKey="highways" stackId="a" fill="#82ca9d" name="Highways" />
                  <Bar dataKey="amenities" stackId="a" fill="#ffc658" name="Amenities" />
                  <Bar dataKey="other" stackId="a" fill="#ff7300" name="Other" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Feature Distribution</Card.Title>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={featureDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {featureDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Statistics */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Detailed Feature Statistics</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center p-3">
                    <h4 className="text-primary">{summaryStats.buildings.toLocaleString()}</h4>
                    <p className="mb-0">Buildings</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3">
                    <h4 className="text-success">{summaryStats.highways.toLocaleString()}</h4>
                    <p className="mb-0">Highways</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3">
                    <h4 className="text-warning">{summaryStats.amenities.toLocaleString()}</h4>
                    <p className="mb-0">Amenities</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3">
                    <h4 className="text-info">{summaryStats.other.toLocaleString()}</h4>
                    <p className="mb-0">Other Features</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ChapterStats
