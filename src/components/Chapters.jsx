import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Alert } from 'react-bootstrap'
import { getChaptersData, getChapterById } from '../config'
import ChapterSelector from './ChapterSelector'
import ChapterStats from './ChapterStats'

function Chapters() {
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapters, setChapters] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load chapters data
    const chaptersData = getChaptersData()
    if (chaptersData && chaptersData.length > 0) {
      // Filter out chapters with missing data and sort alphabetically
      const validChapters = chaptersData
        .filter(chapter => chapter.chapter && chapter.chapter_id && chapter.country)
        .sort((a, b) => (a.chapter || '').localeCompare(b.chapter || ''))
      
      setChapters(validChapters)
    }
  }, [])

  useEffect(() => {
    // Load weekly activity data when a chapter is selected
    if (selectedChapterId) {
      setLoading(true)
      loadWeeklyActivityData(selectedChapterId)
    } else {
      setWeeklyData([])
      setSelectedChapter(null)
    }
  }, [selectedChapterId])

  const loadWeeklyActivityData = async (chapterId) => {
    try {
      const response = await fetch('/weekly_chapter_activity.csv')
      const csvText = await response.text()
      
      // Parse CSV data
      const lines = csvText.trim().split('\n')
      const headers = lines[0].split(',')
      
      // Filter data for the selected chapter
      const chapterData = lines.slice(1)
        .map(line => {
          const values = line.split(',')
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })
          return row
        })
        .filter(row => parseInt(row.chapter_id) === parseInt(chapterId))
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

      setWeeklyData(chapterData)
      
      // Get chapter details
      const chapterInfo = getChapterById(parseInt(chapterId))
      setSelectedChapter(chapterInfo)
      
    } catch (error) {
      console.error('Error loading weekly activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChapterChange = (chapterId) => {
    setSelectedChapterId(chapterId)
  }

  return (
    <Container className="mt-5 pt-3">
      <Row className="mb-4">
        <Col>
          <h1>Chapter Statistics</h1>
          <p className="lead">
            Explore detailed activity statistics for individual YouthMappers chapters.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <div className="mb-3">
            <label className="form-label fs-5 fw-bold text-primary mb-3">
              Select a Chapter
            </label>
            <ChapterSelector
              selectedChapter={selectedChapterId}
              onChapterChange={handleChapterChange}
              chapters={chapters}
            />
          </div>
        </Col>
      </Row>

      {selectedChapter && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>{selectedChapter.chapter}</Card.Title>
                <Row>
                  <Col md={6}>
                    {selectedChapter.university && (
                      <p>🎓 {selectedChapter.university}</p>
                    )}
                    {(selectedChapter.city || selectedChapter.country) && (
                      <p>📍 {[selectedChapter.city, selectedChapter.country].filter(Boolean).join(', ')}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <p>🌐 <a href={`https://mapping.team/teams/${selectedChapter.chapter_id}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">mapping.team/teams/{selectedChapter.chapter_id}</a></p>
                    {weeklyData.length > 0 && (
                      <p>📅 {weeklyData[weeklyData.length - 1]?.week.toLocaleDateString()}</p>
                    )}
                  </Col>
                </Row>
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

      {selectedChapterId && weeklyData.length > 0 && !loading && (
        <ChapterStats weeklyData={weeklyData} chapter={selectedChapter} />
      )}

      {selectedChapterId && weeklyData.length === 0 && !loading && (
        <Row>
          <Col>
            <Alert variant="warning">
              No activity data found for this chapter. This chapter may not have any recorded mapping activity yet.
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default Chapters
