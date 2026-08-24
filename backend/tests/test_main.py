from app.main import status


def test_status():
    assert status() == {"status": "online"}
