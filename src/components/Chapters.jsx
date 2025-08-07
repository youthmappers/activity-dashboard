import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Alert } from 'react-bootstrap'
import { getChaptersData, getChapterById } from '../config'
import ChapterSearch from './ChapterSearch'
import ChapterStats from './ChapterStats'

function Chapters({ selectedChapters: sharedSelectedChapters, onChapterChange: onSharedChapterChange, chapters: sharedChapters }) {
  const [chapters, setChapters] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [selectedChapterDetails, setSelectedChapterDetails] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Use shared chapters if available, otherwise load them
    if (sharedChapters && sharedChapters.length > 0) {
      setChapters(sharedChapters)
    } else {
      // Load chapters data (fallback)
      const chaptersData = getChaptersData()
      if (chaptersData && chaptersData.length > 0) {
        // Filter out chapters with missing data and sort alphabetically
        const validChapters = chaptersData
          .filter(chapter => chapter.chapter && chapter.chapter_id && chapter.country)
          .sort((a, b) => (a.chapter || '').localeCompare(b.chapter || ''))
        
        setChapters(validChapters)
      }
    }
  }, [sharedChapters])

  useEffect(() => {
    // Load weekly activity data when chapters are selected
    if (sharedSelectedChapters && sharedSelectedChapters.length > 0) {
      setLoading(true)
      loadWeeklyActivityData(sharedSelectedChapters)
    } else {
      setWeeklyData([])
      setSelectedChapterDetails([])
    }
  }, [sharedSelectedChapters])

  const loadWeeklyActivityData = async (chapterIds) => {
    try {
      const response = await fetch('/weekly_chapter_activity.csv')
      const csvText = await response.text()
      
      // Parse CSV data
      const lines = csvText.trim().split('\n')
      const headers = lines[0].split(',')
      
      // Filter data for the selected chapters
      const selectedChapterSet = new Set(chapterIds.map(id => parseInt(id)))
      const filteredData = lines.slice(1)
        .map(line => {
          const values = line.split(',')
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })
          return row
        })
        .filter(row => selectedChapterSet.has(parseInt(row.chapter_id)))
        .map(row => ({
          ...row,
          week: new Date(row.week),
          all_feats: parseInt(row.all_feats) || 0,
          buildings: parseInt(row.buildings) || 0,
          highways: parseInt(row.highways) || 0,
          amenities: parseInt(row.amenities) || 0,
          other: parseInt(row.other) || 0,
          mappers: parseInt(row.mappers) || 0
        }))
        .sort((a, b) => a.week - b.week)

      setWeeklyData(filteredData)
      
      // Get chapter details for selected chapters
      const chapterDetails = chapterIds.map(id => getChapterById(parseInt(id))).filter(Boolean)
      setSelectedChapterDetails(chapterDetails)
      
    } catch (error) {
      console.error('Error loading weekly activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="mt-5 pt-3">
      <Row className="mb-4">
        <Col>
          <h1>Chapter Statistics</h1>
          <p className="lead">
            Search and select YouthMappers chapters to view their detailed activity statistics and trends.
          </p>
        </Col>
      </Row>

      {/* Shared Chapter Search Component */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Select Chapters for Analysis</Card.Title>
              <ChapterSearch
                selectedChapters={sharedSelectedChapters || []}
                onChapterChange={onSharedChapterChange}
                chapters={chapters}
              />
              {sharedSelectedChapters && sharedSelectedChapters.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted">
                    {sharedSelectedChapters.length} chapter{sharedSelectedChapters.length === 1 ? '' : 's'} selected. 
                    This selection is shared between the Map and Chapters pages.
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Selected Chapters Details */}
      {selectedChapterDetails.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>
                  {selectedChapterDetails.length === 1 ? 'Selected Chapter' : 'Selected Chapters'}
                </Card.Title>
                {selectedChapterDetails.map((chapter, index) => (
                  <div key={chapter.chapter_id} className={index > 0 ? 'mt-3 pt-3 border-top' : ''}>
                    <h5>{chapter.chapter}</h5>
                    <Row>
                      <Col md={6}>
                        {chapter.university && (
                          <p className="mb-1">🎓 {chapter.university}</p>
                        )}
                        {(chapter.city || chapter.country) && (
                          <p className="mb-1">📍 {[chapter.city, chapter.country].filter(Boolean).join(', ')}</p>
                        )}
                      </Col>
                      <Col md={6}>
                        <p className="mb-1">
                          🌐 <a 
                            href={`https://mapping.team/teams/${chapter.chapter_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-decoration-none"
                          >
                            mapping.team/teams/{chapter.chapter_id}
                          </a>
                        </p>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {loading && (
        <Row>
          <Col>
            <Alert variant="info">Loading chapter statistics...</Alert>
          </Col>
        </Row>
      )}

      {!sharedSelectedChapters || sharedSelectedChapters.length === 0 ? (
        <Row>
          <Col>
            <Alert variant="info">
              <h4>Select Chapters to View Statistics</h4>
              <p>Use the search above to select one or more YouthMappers chapters and view their detailed activity statistics, trends, and mapping contributions over time.</p>
            </Alert>
          </Col>
        </Row>
      ) : weeklyData.length > 0 && !loading ? (
        <ChapterStats 
          weeklyData={weeklyData} 
          chapter={selectedChapterDetails.length === 1 ? selectedChapterDetails[0] : null}
          chapters={selectedChapterDetails}
        />
      ) : !loading && (
        <Row>
          <Col>
            <Alert variant="warning">
              No activity data found for the selected chapter{sharedSelectedChapters.length === 1 ? '' : 's'}. 
              {sharedSelectedChapters.length === 1 ? 'This chapter may' : 'These chapters may'} not have any recorded mapping activity yet.
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default Chapters
