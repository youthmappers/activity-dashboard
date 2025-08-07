import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Image, Card } from 'react-bootstrap'
import { getCdnAssetUrl, getCdnBaseUrl, getChaptersData } from '../config'

function About() {
  const [chapterStats, setChapterStats] = useState({
    totalChapters: 0,
    totalCountries: 0,
    totalMappers: 'thousands of'
  })

  useEffect(() => {
    const calculateStats = () => {
      const chapters = getChaptersData()
      
      if (chapters && chapters.length > 0) {
        // Count total chapters
        const totalChapters = chapters.length
        
        // Count unique countries (excluding null/empty countries)
        const countries = new Set()
        chapters.forEach(chapter => {
          if (chapter.country && chapter.country.trim() !== '') {
            countries.add(chapter.country)
          }
        })
        const totalCountries = countries.size
        
        setChapterStats({
          totalChapters,
          totalCountries,
          totalMappers: 'thousands of'
        })
      }
    }

    // Calculate stats when component mounts
    calculateStats()
  }, [])

  return (
    <Container className="mt-5 pt-3">
      {/* Main Introduction Section */}
      <Row className="mb-5">
        <Col lg={8}>
          <h1>YouthMappers Activity Tracker</h1>
          <p>
            This dashboard quantifies the OpenStreetMap editing activity by mappers 
            associated with YouthMappers chapters around the globe. There are over{' '}
            <strong>{chapterStats.totalChapters}</strong> chapters in more than{' '}
            <strong>{chapterStats.totalCountries}</strong> countries 
            around the world. This dashboard shows edits from{' '}
            <strong>{chapterStats.totalMappers}</strong> mappers in these chapters.
          </p>
          
          <h4 className="pt-2">Don't see your edits or your chapter?</h4>
          <p>
            We can only track edits by mappers that are registered or listed in an 
            official YouthMappers chapter on OSM Teams.{' '}
            <a href="#osmteams">Please see the instructions to join your chapter on OSM Teams!</a>
          </p>
        </Col>
        <Col lg={4} className="text-end">
          <Image 
            fluid 
            src={getCdnAssetUrl('dashboard_screenshot.png')} 
            alt="Screenshot of the YouthMappers Activity Tracker dashboard"
          />
        </Col>
      </Row>

      {/* Using The Map Section */}
      <Row className="mb-4">
        <Col lg={8}>
          <h4 className="pt-3">Using The Map</h4>
          
          <h6>Filtering by Time</h6>
          <p>
            The timeline along the bottom shows the relative number of chapters active 
            each day in OSM. By <code>clicking and dragging</code> across the timeline, 
            the map will filter to only show changesets submitted in that time range.
          </p>
          
          <h6>Changeset Information</h6>
          <p>
            <code>Click</code> <em>Show Bounding Boxes</em> to show the bounding box 
            of changesets performed that day. The bounding boxes appear unstraight 
            because they can also be viewed in 3d!
          </p>
        </Col>
        <Col lg={4} className="text-end">
          <Image 
            fluid 
            src={getCdnAssetUrl('pokhara_bboxes.png')} 
            alt="Map showing bounding boxes in Pokhara"
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <p>
            Tilt the map with <code>Control + Click &amp; Drag</code> to see the actual 
            terrain. The numbers inside the bounding boxes represent the number of features 
            edited in that box on any given day. Hovering over this number will give more information.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Image 
            fluid 
            src={getCdnAssetUrl('terrain.jpg')} 
            alt="A terrain visualization image"
            className="w-100"
          />
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h6>Filtering by Chapter</h6>
          <p>
            Choosing a chapter from the Dropdown menu labeled <code>Choose A Chapter</code> will 
            show only edits from mappers associated with that chapter. Multiple chapters can be 
            chosen consecutively. Chapters can be unselected by clicking the <code>[X]</code> button 
            next to their name.
          </p>

          <div className="mt-4" id="how">
            <h4>How are these numbers calculated?</h4>
          </div>

          <p>
            Did you know that the entire editing history of OpenStreetMap is available in a 
            queryable database part of Amazon's{' '}
            <a href="https://registry.opendata.aws/osm/" target="_blank" rel="noopener noreferrer">
              Open Data Program
            </a>
            ? We search the full history to count all of the edits to highways, buildings, 
            amenities, or other objects by OSM users known to be in, or have been part of 
            a YouthMappers chapter.
          </p>
          <p>
            The numbers presented here are just a subset of all edits from YouthMappers chapters 
            because there many mappers associated with YouthMappers chapters that are not yet 
            registered on OSM Teams. If you are part of a YouthMappers chapter and not registered 
            on OSM Teams,{' '}
            <a href="#osmteams">please see the instructions to join your chapter on OSM Teams!</a>
          </p>
        </Col>
      </Row>

      {/* Data Download Section */}
      <Row className="mb-5">
        <Col>
          <h3 id="analysis-example">Can I download the data for use in my own analysis?</h3>
          <p>
            All of the data that powers the map on this website is available as GeoParquet here:{' '}
            <code>{getCdnBaseUrl()}/activity/daily_rollup.parquet</code>
          </p>
          
          <p>
            You can download it and read it with an analysis tool like GeoPandas.
          </p>
    
          <p>
            You can also access the data directly on S3 with{' '}
            <a href="https://duckdb.org/" target="_blank" rel="noopener noreferrer">DuckDB</a>:
          </p>
          
          <Card className="mb-3">
            <Card.Body>
              <pre className="mb-0">
{`SELECT 
  sum(buildings.new), sum(buildings.edited)
FROM 
  read_parquet('${getCdnBaseUrl()}/activity/daily_rollup.parquet');`}
              </pre>
            </Card.Body>
          </Card>
          
          <p>You should see something similar to this:</p>
          
          <Card className="mb-3">
            <Card.Body>
              <pre className="mb-0">
{`┌──────────────────────┬───────────────────────┐
│ sum(buildings."new") │ sum(buildings.edited) │
│        int128        │        int128         │
├──────────────────────┼───────────────────────┤
│           25,174,061 │             2,051,233 │
└──────────────────────┴───────────────────────┘`}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <hr id="osmteams" className="mt-4 pt-4" />

      {/* OSM Teams Section */}
      <Row className="mt-4 pt-4 mb-4">
        <Col lg={7}>
          <h1>OSM Teams</h1>
          
          <p>
            OSM Teams is a platform that allows OpenStreetMap users to organize themselves 
            into <em>teams</em>. This allows more convenient tracking of membership among 
            groups of mappers, which enables easier collection of mapping metrics and statistics.
          </p>
    
          <h2 className="pt-4">YouthMappers on OSM Teams</h2>
          <p>
            The{' '}
            <a href="https://mapping.team/organizations/1" target="_blank" rel="noopener noreferrer">
              YouthMappers Organization
            </a>{' '}
            on OSM Teams consists of more than 2,200 mappers across more than 300 teams. 
            Each team represents an active YouthMappers chapter. Edits from mappers that are 
            members of these teams are counted on the{' '}
            <a href="https://activity.youthmappers.org">Activity Tracker</a>.
          </p>
        </Col>
        <Col lg={5} className="text-end">
          <Image 
            fluid 
            width="400" 
            src={getCdnAssetUrl('osm_teams/osm_teams_org_page.png')} 
            alt="Screenshot of the OSM Teams organization page"
          />
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <h4>How do I join my YouthMappers chapter on OSM Teams?</h4>
          <p>
            You need a specific invite link to join a chapter. You can get this link from 
            your chapter moderator, or simply send Jennings a message on OSM with the name 
            of your chapter, and he will reply with an invite link.{' '}
            <a href="https://www.openstreetmap.org/message/new/Jennings%20Anderson">
              Click here to send Jennings a message on OSM.
            </a>
          </p>

          <p>
            Even if you already graduated, please register for OSM Teams so that we may 
            count you among one of the thousands of successful YouthMappers alumni!
          </p>
        </Col>
      </Row>
      
      <hr />
      
      <Row className="mb-4">
        <Col>
          <h4 id="how-to-log-into-osmteams">Logging into OSM Teams using your OpenStreetMap account</h4>
          <p>
            When you follow your invite link, you may be prompted to log into both OSM Teams 
            and OpenStreetMap. Follow these instructions to connect these accounts:
          </p>
        </Col>
      </Row>
      
      {/* Auth Flow Steps */}
      <Row className="mb-4">
        <Col md={4}>
          <h5>1. Click "Sign In"</h5>
          <p>If you are not already logged in, OSM Teams will ask you to sign in.</p>
          <Image 
            fluid 
            src={getCdnAssetUrl('osm_teams/osm_teams_auth_flow/osm_teams_auth_flow.001.png')} 
            alt="Step 1: Click 'Sign In' on OSM Teams"
          />
        </Col>
        <Col md={4}>
          <h5>2. Click "Login with OSM"</h5>
          <p>OSM Teams uses your OpenStreetMap account.</p>
          <Image 
            fluid 
            src={getCdnAssetUrl('osm_teams/osm_teams_auth_flow/osm_teams_auth_flow.002.png')} 
            alt="Step 2: Click 'Login with OSM' on OSM Teams"
          />
        </Col>
        <Col md={4}>
          <h5>3. Sign into OpenStreetMap</h5>
          <p>Enter your OpenStreetMap username and password</p>
          <Image 
            fluid 
            src={getCdnAssetUrl('osm_teams/osm_teams_auth_flow/osm_teams_auth_flow.003.png')} 
            alt="Step 3: Sign into OpenStreetMap"
          />
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={4}>
          <h5>4. Grant Access to your OpenStreetMap account</h5>
          <Image 
            fluid 
            src={getCdnAssetUrl('osm_teams/osm_teams_auth_flow/osm_teams_auth_flow.004.png')} 
            alt="Step 4: Grant Access to your OpenStreetMap account"
          />
        </Col>
        <Col md={4}>
          <h5>5. Click "Allow Access"</h5>
          <Image 
            fluid 
            src={getCdnAssetUrl('osm_teams/osm_teams_auth_flow/osm_teams_auth_flow.005.png')} 
            alt="Step 5: Allow OSM Teams Access to your OpenStreetMap Account"
          />
        </Col>
        <Col md={4}>
          <h5>6. Success!</h5>
          <Image 
            fluid 
            src={getCdnAssetUrl('osm_teams/osm_teams_auth_flow/osm_teams_auth_flow.006.png')} 
            alt="Step 6: Success message displayed after completing the OSM Teams login process"
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <p>
            After successfully accepting your invitation, you will be automatically redirected 
            to your team profile page. Here you can fill out your OSM Teams profile.{' '}
            <strong>This is the most important part!</strong>
          </p>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6}>
          <h5>Edit Profile Page</h5>
          <Image 
            fluid 
            src={getCdnAssetUrl('osm_teams/edit_profile_hires_2.png')} 
            alt="Edit profile page screenshot"
          />
          <p>
            YouthMapper profiles include demographic questions such as age and gender, 
            and ask what you are studying, and when you plan on graduating.
            <br /><br />
            <em>
              If you have already graduated, please put the date of your graduation 
              so we know you are one of the many YouthMapper alumni.
            </em>
          </p>
        </Col>
        <Col md={6}>
          <h5>Complete your profile</h5>
          <Image 
            fluid 
            src={getCdnAssetUrl('osm_teams/osm_teams_auth_flow/osm_teams_auth_flow.007.png')} 
            alt="Step showing the completion of the OSM Teams profile setup"
          />
          <p>
            Once you fill out all of the questions on your profile page, please read 
            the YouthMappers Privacy Policy for OSM Teams.
            <br /><br />
            <em>
              Only after you consent to your data being used in YouthMappers research 
              can you click "Submit" to complete your profile.
            </em>
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <p>
            Thank you for joining YouthMappers on OSM Teams! We use the information 
            submitted to better track the membership of YouthMappers chapters all around 
            the world. As the platform continues to develop, new features will become available.
          </p>
        </Col>
      </Row>

      {/* Footer */}
      <hr />
      <Row className="mb-4">
        <Col>
          <p className="text-muted small">
            Website and metrics created and maintained by{' '}
            <a href="https://youthmappers.org/" target="_blank" rel="noopener noreferrer">
              YouthMappers
            </a>{' '}
            and{' '}
            <a href="https://jenningsanderson.com" target="_blank" rel="noopener noreferrer">
              Jennings Anderson
            </a>
            . Built with open source tools supported by{' '}
            <a href="https://github.com/felt/tippecanoe" target="_blank" rel="noopener noreferrer">
              Felt
            </a>
            ,{' '}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer">
              Mapbox
            </a>
            ,{' '}
            <a href="https://d3js.org" target="_blank" rel="noopener noreferrer">
              d3.js
            </a>
            , and more. Map data &copy;{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
              OpenStreetMap
            </a>{' '}
            Contributors.
          </p>
        </Col>
      </Row>
    </Container>
  )
}

export default About
